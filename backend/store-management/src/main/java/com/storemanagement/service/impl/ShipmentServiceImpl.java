package com.storemanagement.service.impl;

import com.storemanagement.dto.ghn.GHNTrackingDTO;
import com.storemanagement.dto.shipment.ShipmentDTO;
import com.storemanagement.mapper.ShipmentMapper;
import com.storemanagement.model.Order;
import com.storemanagement.model.Shipment;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.ShipmentRepository;
import com.storemanagement.service.GHNService;
import com.storemanagement.service.ShipmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ShipmentServiceImpl implements ShipmentService {
    
    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShipmentMapper shipmentMapper;
    private final GHNService ghnService;

    @Override
    @Transactional(readOnly = true)
    public ShipmentDTO getShipmentById(Integer shipmentId) {
        log.info("Getting shipment by ID: {}", shipmentId);
        
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new EntityNotFoundException("Shipment không tồn tại với ID: " + shipmentId));
        
        return shipmentMapper.toDTO(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentDTO getShipmentByOrderId(Integer orderId) {
        log.info("Getting shipment by order ID: {}", orderId);
        
        Shipment shipment = shipmentRepository.findByOrder_IdOrder(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Shipment không tồn tại cho order ID: " + orderId));
        
        return shipmentMapper.toDTO(shipment);
    }

    @Override
    public ShipmentDTO syncWithGHN(Integer shipmentId) {
        log.info("Syncing shipment with GHN: shipmentId={}", shipmentId);
        
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new EntityNotFoundException("Shipment không tồn tại với ID: " + shipmentId));
        
        if (shipment.getGhnOrderCode() == null || shipment.getGhnOrderCode().isEmpty()) {
            throw new RuntimeException("Shipment không có GHN order code. Không thể sync với GHN.");
        }
        
        if (!ghnService.isEnabled()) {
            log.warn("GHN integration is disabled. Cannot sync.");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            // Gọi GHN API để lấy thông tin mới nhất
            var orderInfo = ghnService.getOrderInfo(shipment.getGhnOrderCode());
            
            // Cập nhật shipment với thông tin từ GHN
            shipment.setGhnStatus(orderInfo.getStatus());
            shipment.setGhnUpdatedAt(LocalDateTime.now());
            
            if (orderInfo.getNote() != null && !orderInfo.getNote().isEmpty()) {
                shipment.setGhnNote(orderInfo.getNote());
            }
            
            // Sync shippingStatus
            syncShippingStatus(shipment, orderInfo.getStatus());
            
            // Lưu shipment
            shipmentRepository.save(shipment);
            
            // Sync Order.status nếu cần
            if (shipment.getOrder() != null) {
                syncOrderStatus(shipment.getOrder(), orderInfo.getStatus());
            }
            
            log.info("Successfully synced shipment with GHN: shipmentId={}, newStatus={}", 
                shipmentId, orderInfo.getStatus());
            
            return shipmentMapper.toDTO(shipment);
            
        } catch (Exception e) {
            log.error("Error syncing shipment with GHN", e);
            throw new RuntimeException("Failed to sync shipment with GHN: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public GHNTrackingDTO getShipmentTracking(Integer shipmentId) {
        log.info("Getting shipment tracking: shipmentId={}", shipmentId);
        
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new EntityNotFoundException("Shipment không tồn tại với ID: " + shipmentId));
        
        if (shipment.getGhnOrderCode() == null || shipment.getGhnOrderCode().isEmpty()) {
            throw new RuntimeException("Shipment không có GHN order code. Không thể lấy tracking.");
        }
        
        if (!ghnService.isEnabled()) {
            log.warn("GHN integration is disabled. Cannot get tracking.");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            // Gọi GHN API để lấy tracking info
            GHNTrackingDTO tracking = ghnService.trackOrder(shipment.getGhnOrderCode());
            
            log.info("Successfully got tracking info for shipment: shipmentId={}", shipmentId);
            
            return tracking;
            
        } catch (Exception e) {
            log.error("Error getting shipment tracking", e);
            throw new RuntimeException("Failed to get shipment tracking: " + e.getMessage(), e);
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
                
            default:
                // Các trạng thái khác giữ nguyên
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
            if (order.getStatus() != Order.OrderStatus.COMPLETED) {
                log.info("Updating order status to COMPLETED. Order ID: {}", order.getIdOrder());
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setDeliveredAt(LocalDateTime.now());
                orderRepository.save(order);
            }
        } else if ("cancel".equals(ghnStatus)) {
            if (order.getStatus() == Order.OrderStatus.PENDING || 
                order.getStatus() == Order.OrderStatus.CONFIRMED) {
                log.info("Updating order status to CANCELED. Order ID: {}", order.getIdOrder());
                order.setStatus(Order.OrderStatus.CANCELED);
                orderRepository.save(order);
            }
        }
    }
}

