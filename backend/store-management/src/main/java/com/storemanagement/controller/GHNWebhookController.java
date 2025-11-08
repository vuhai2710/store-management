package com.storemanagement.controller;

import com.storemanagement.dto.ghn.GHNWebhookDto;
import com.storemanagement.model.Order;
import com.storemanagement.model.Shipment;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Controller xử lý webhook từ GHN (Giao Hàng Nhanh)
 * 
 * Base URL: /api/v1/ghn
 * 
 * Mục đích:
 * - Nhận webhook callback từ GHN khi có cập nhật trạng thái đơn hàng
 * - Cập nhật Shipment.ghnStatus, ghnUpdatedAt, ghnNote
 * - Sync với Shipment.shippingStatus và Order.status
 * 
 * Logic xử lý webhook:
 * 1. Nhận webhook request body từ GHN
 * 2. Parse request body thành GHNWebhookDto
 * 3. Tìm Shipment theo ghnOrderCode từ webhook data
 * 4. Cập nhật Shipment với thông tin từ webhook:
 *    - ghnStatus: Trạng thái mới từ GHN
 *    - ghnUpdatedAt: Thời gian cập nhật
 *    - ghnNote: Ghi chú/Lý do (nếu có)
 * 5. Sync Shipment.shippingStatus với ghnStatus:
 *    - ready_to_pick, picking → PREPARING
 *    - picked, storing, transporting, sorting, delivering → SHIPPED
 *    - delivered → DELIVERED
 *    - delivery_fail, return_fail, exception, damage, lost → Cần xử lý đặc biệt
 * 6. Sync Order.status nếu cần:
 *    - Khi delivered → Order.status = COMPLETED (nếu chưa)
 * 7. Return 200 OK cho GHN
 * 
 * Lưu ý quan trọng:
 * - Phải xử lý idempotent (không update 2 lần nếu nhận duplicate webhook)
 * - Phải return 200 OK ngay cả khi có lỗi (để GHN không retry)
 * - Log đầy đủ để debug
 */
@RestController
@RequestMapping("/api/v1/ghn")
@RequiredArgsConstructor
@Slf4j
public class GHNWebhookController {
    
    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    
    /**
     * Webhook endpoint để nhận callback từ GHN
     * 
     * Endpoint: POST /api/v1/ghn/webhook
     * Authentication: Không cần (PUBLIC - GHN sẽ gọi từ bên ngoài)
     * 
     * Logic xử lý:
     * 1. Nhận webhook request body từ GHN
     * 2. Parse request body thành GHNWebhookDto
     * 3. Tìm Shipment theo ghnOrderCode
     * 4. Cập nhật Shipment với thông tin từ webhook
     * 5. Sync Shipment.shippingStatus và Order.status
     * 6. Return 200 OK
     * 
     * @param webhookDto GHNWebhookDto từ request body
     * @return 200 OK (luôn luôn, để GHN không retry)
     */
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<Map<String, String>> webhook(@RequestBody GHNWebhookDto webhookDto) {
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
    
    /**
     * Sync Shipment.shippingStatus với ghnStatus
     * 
     * Logic mapping:
     * - ready_to_pick, picking → PREPARING
     * - picked, storing, transporting, sorting, delivering, money_collect_delivering → SHIPPED
     * - delivered → DELIVERED
     * - delivery_fail, return_fail, exception, damage, lost → Giữ nguyên hoặc xử lý đặc biệt
     * 
     * @param shipment Shipment entity cần sync
     * @param ghnStatus Trạng thái từ GHN
     */
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
    
    /**
     * Sync Order.status với ghnStatus
     * 
     * Logic:
     * - Khi delivered → Order.status = COMPLETED (nếu chưa)
     * - Khi cancel → Order.status = CANCELED (nếu đang PENDING hoặc CONFIRMED)
     * 
     * @param order Order entity cần sync
     * @param ghnStatus Trạng thái từ GHN
     */
    private void syncOrderStatus(Order order, String ghnStatus) {
        if (order == null || ghnStatus == null || ghnStatus.isEmpty()) {
            return;
        }
        
        if ("delivered".equals(ghnStatus)) {
            // Khi GHN giao hàng thành công → Order.status = COMPLETED
            if (order.getStatus() != Order.OrderStatus.COMPLETED) {
                log.info("Updating order status to COMPLETED. Order ID: {}", order.getIdOrder());
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setDeliveredAt(LocalDateTime.now());
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

