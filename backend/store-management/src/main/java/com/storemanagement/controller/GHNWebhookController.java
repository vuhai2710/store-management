package com.storemanagement.controller;

import com.storemanagement.dto.ghn.GHNWebhookDTO;
import com.storemanagement.model.Order;
import com.storemanagement.model.Shipment;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.ShipmentRepository;
import com.storemanagement.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ghn")
@RequiredArgsConstructor
@Slf4j
public class GHNWebhookController {
    
    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final SystemSettingService systemSettingService;

    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<Map<String, String>> webhook(@RequestBody GHNWebhookDTO webhookDto) {
        log.info("Received GHN webhook. OrderCode: {}, Status: {}", 
            webhookDto.getOrderCode(), webhookDto.getStatus());
        
        try {
            // Tìm Shipment theo ghnOrderCode
            Shipment shipment = shipmentRepository.findByGhnOrderCode(webhookDto.getOrderCode())
                .orElse(null);
            
            if (shipment == null) {
                log.warn("Shipment not found for GHN order code: {}. Ignoring webhook.", 
                    webhookDto.getOrderCode());
                // Return 200 OK để GHN không retry
                return ResponseEntity.ok(Map.of("status", "warning", 
                    "message", "Shipment not found"));
            }
            
            log.info("Found shipment ID: {} for GHN order code: {}", 
                shipment.getIdShipment(), webhookDto.getOrderCode());
            
            // Cập nhật Shipment với thông tin từ webhook
            shipment.setGhnStatus(webhookDto.getStatus());
            
            // Parse updated_at nếu có
            if (webhookDto.getUpdatedAt() != null && !webhookDto.getUpdatedAt().isEmpty()) {
                try {
                    // GHN trả về ISO 8601 datetime string
                    LocalDateTime updatedAt = LocalDateTime.parse(
                        webhookDto.getUpdatedAt(), 
                        DateTimeFormatter.ISO_DATE_TIME
                    );
                    shipment.setGhnUpdatedAt(updatedAt);
                } catch (Exception e) {
                    log.warn("Failed to parse updatedAt: {}. Using current time.", 
                        webhookDto.getUpdatedAt());
                    shipment.setGhnUpdatedAt(LocalDateTime.now());
                }
            } else {
                shipment.setGhnUpdatedAt(LocalDateTime.now());
            }
            
            // Cập nhật ghi chú nếu có
            if (webhookDto.getNote() != null && !webhookDto.getNote().isEmpty()) {
                shipment.setGhnNote(webhookDto.getNote());
            }
            
            // Sync Shipment.shippingStatus với ghnStatus
            syncShippingStatus(shipment, webhookDto.getStatus());
            
            // Lưu Shipment
            shipmentRepository.save(shipment);
            
            // Sync Order.status nếu cần
            syncOrderStatus(shipment.getOrder(), webhookDto.getStatus());
            
            log.info("Successfully processed GHN webhook for order code: {}. New status: {}", 
                webhookDto.getOrderCode(), webhookDto.getStatus());
            
            // Return 200 OK cho GHN
            return ResponseEntity.ok(Map.of("status", "success", 
                "message", "Webhook processed"));
            
        } catch (Exception e) {
            log.error("Error processing GHN webhook", e);
            // Return 200 OK để GHN không retry
            // Log error để debug sau
            return ResponseEntity.ok(Map.of("status", "error", 
                "message", "Internal error: " + e.getMessage()));
        }
    }

    private void syncShippingStatus(Shipment shipment, String ghnStatus) {
        if (ghnStatus == null || ghnStatus.isEmpty()) {
            return;
        }
        
        Shipment.ShippingStatus newStatus = null;
        
        switch (ghnStatus) {
            case "ready_to_pick":
            case "picking":
                newStatus = Shipment.ShippingStatus.PREPARING;
                break;
                
            case "picked":
            case "storing":
            case "transporting":
            case "sorting":
            case "delivering":
            case "money_collect_delivering":
                newStatus = Shipment.ShippingStatus.SHIPPED;
                break;
                
            case "delivered":
                newStatus = Shipment.ShippingStatus.DELIVERED;
                break;
                
            case "cancel":
            case "delivery_fail":
            case "return_fail":
            case "exception":
            case "damage":
            case "lost":
                // Các trạng thái lỗi - giữ nguyên status hiện tại hoặc xử lý đặc biệt
                log.warn("GHN order has error status: {}. Shipment ID: {}", 
                    ghnStatus, shipment.getIdShipment());
                break;
                
            default:
                log.warn("Unknown GHN status: {}. Shipment ID: {}", 
                    ghnStatus, shipment.getIdShipment());
                break;
        }
        
        if (newStatus != null && shipment.getShippingStatus() != newStatus) {
            log.info("Updating shipment shipping status: {} -> {}. Shipment ID: {}", 
                shipment.getShippingStatus(), newStatus, shipment.getIdShipment());
            shipment.setShippingStatus(newStatus);
        }
    }

    private void syncOrderStatus(Order order, String ghnStatus) {
        if (order == null || ghnStatus == null || ghnStatus.isEmpty()) {
            return;
        }
        
        if ("delivered".equals(ghnStatus)) {
            // Khi GHN giao hàng thành công → Order.status = COMPLETED
            if (order.getStatus() != Order.OrderStatus.COMPLETED) {
                LocalDateTime now = LocalDateTime.now();
                log.info("Updating order status to COMPLETED. Order ID: {}", order.getIdOrder());
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setDeliveredAt(now);
                order.setCompletedAt(now); // Thời điểm hoàn thành dùng để tính hạn đổi trả
                // Snapshot returnWindowDays từ system settings
                int returnWindowDays = systemSettingService.getReturnWindowDays();
                order.setReturnWindowDays(returnWindowDays);
                log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", now, returnWindowDays, order.getIdOrder());
                orderRepository.save(order);
            }
        } else if ("cancel".equals(ghnStatus)) {
            // Khi GHN hủy đơn → Order.status = CANCELED (nếu chưa)
            if (order.getStatus() == Order.OrderStatus.PENDING || 
                order.getStatus() == Order.OrderStatus.CONFIRMED) {
                log.info("Updating order status to CANCELED. Order ID: {}", order.getIdOrder());
                order.setStatus(Order.OrderStatus.CANCELED);
                orderRepository.save(order);
            }
        }
    }
}

