package com.storemanagement.service.impl;

import com.storemanagement.config.GHNConfig;
import com.storemanagement.dto.ghn.GHNCreateOrderRequestDTO;
import com.storemanagement.dto.ghn.GHNCreateOrderResponseDTO;
import com.storemanagement.dto.ghn.GHNOrderInfoDTO;
import com.storemanagement.dto.ghn.GHNOrderItemDTO;
import com.storemanagement.dto.ghn.GHNServiceDTO;
import com.storemanagement.dto.ghn.GHNTrackingDTO;
import com.storemanagement.dto.shipment.ShipmentDTO;
import com.storemanagement.mapper.ShipmentMapper;
import com.storemanagement.model.Order;
import com.storemanagement.model.OrderDetail;
import com.storemanagement.model.Product;
import com.storemanagement.model.Shipment;
import com.storemanagement.model.ShippingAddress;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.ShipmentRepository;
import com.storemanagement.service.GHNService;
import com.storemanagement.service.ShipmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ShipmentServiceImpl implements ShipmentService {
    
    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShipmentMapper shipmentMapper;
    private final GHNService ghnService;
    private final GHNConfig ghnConfig;

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
            var orderInfo = ghnService.getOrderInfo(shipment.getGhnOrderCode());

            shipment.setGhnStatus(orderInfo.getStatus());
            shipment.setGhnUpdatedAt(LocalDateTime.now());
            
            if (orderInfo.getNote() != null && !orderInfo.getNote().isEmpty()) {
                shipment.setGhnNote(orderInfo.getNote());
            }

            syncShippingStatus(shipment, orderInfo.getStatus());

            shipmentRepository.save(shipment);

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
            GHNTrackingDTO tracking = ghnService.trackOrder(shipment.getGhnOrderCode());
            
            log.info("Successfully got tracking info for shipment: shipmentId={}", shipmentId);
            
            return tracking;
            
        } catch (Exception e) {
            log.error("Error getting shipment tracking", e);
            throw new RuntimeException("Failed to get shipment tracking: " + e.getMessage(), e);
        }
    }

    @Override
    public ShipmentDTO createGHNShipmentForOrder(Integer orderId) {
        log.info("Creating GHN shipment for order ID: {}", orderId);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order không tồn tại với ID: " + orderId));

        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể tạo vận đơn GHN cho đơn hàng đã thanh toán thành công (trạng thái COMPLETED)");
        }

        if (!ghnService.isEnabled()) {
            log.warn("GHN integration is disabled. Cannot create GHN shipment.");
            throw new RuntimeException("GHN integration is disabled");
        }

        ShippingAddress shippingAddress = order.getShippingAddress();
        if (shippingAddress == null) {
            throw new RuntimeException("Đơn hàng không có địa chỉ giao hàng. Không thể tạo vận đơn GHN.");
        }

        if (shippingAddress.getDistrictId() == null || shippingAddress.getWardCode() == null) {
            throw new RuntimeException("Địa chỉ giao hàng chưa có đầy đủ thông tin GHN (districtId/wardCode). Không thể tạo vận đơn.");
        }

        Integer fromDistrictId = ghnConfig.getFromDistrictId();
        if (fromDistrictId == null) {
            throw new RuntimeException("Cấu hình GHN thiếu fromDistrictId (ghn.from-district-id). Không thể tạo vận đơn.");
        }

        Shipment shipment = shipmentRepository.findByOrder_IdOrder(orderId)
                .orElseGet(() -> Shipment.builder()
                        .order(order)
                        .shippingStatus(Shipment.ShippingStatus.PREPARING)
                        .shippingMethod(Shipment.ShippingMethod.GHN)
                        .build());

        if (shipment.getGhnOrderCode() != null && !shipment.getGhnOrderCode().isEmpty()) {
            log.info("Shipment already has GHN order code: {} for order ID: {}", shipment.getGhnOrderCode(), orderId);
            return shipmentMapper.toDTO(shipment);
        }

        List<GHNServiceDTO> services = ghnService.getShippingServices(fromDistrictId, shippingAddress.getDistrictId());
        if (services == null || services.isEmpty()) {
            throw new RuntimeException("Không tìm thấy dịch vụ GHN phù hợp cho tuyến giao hàng này");
        }

        GHNServiceDTO selectedService = services.get(0);
        Integer serviceId = selectedService.getServiceId();

        if (serviceId == null) {
            throw new RuntimeException("Dịch vụ GHN được chọn không có serviceId hợp lệ");
        }

        List<GHNOrderItemDTO> items = new ArrayList<>();
        int totalWeight = 0;

        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();

                String name = detail.getProductNameSnapshot();
                if (name == null && product != null) {
                    name = product.getProductName();
                }

                String code = detail.getProductCodeSnapshot();
                if (code == null && product != null) {
                    code = product.getProductCode();
                }

                if (name == null) {
                    name = "Sản phẩm";
                }

                if (code == null && product != null && product.getIdProduct() != null) {
                    code = String.valueOf(product.getIdProduct());
                }

                int quantity = detail.getQuantity() != null ? detail.getQuantity() : 1;
                int price = detail.getPrice() != null ? detail.getPrice().intValue() : 0;

                items.add(GHNOrderItemDTO.builder()
                        .name(name)
                        .code(code)
                        .quantity(quantity)
                        .price(price)
                        .build());

                totalWeight += 500 * quantity;
            }
        }

        if (totalWeight <= 0) {
            totalWeight = 500;
        }

        if (totalWeight > 30000) {
            totalWeight = 30000;
        }

        BigDecimal finalAmount = order.getFinalAmount() != null ? order.getFinalAmount() : order.getTotalAmount();

        int codAmount = 0;
        if (order.getPaymentMethod() == Order.PaymentMethod.CASH) {
            if (finalAmount != null) {
                codAmount = finalAmount.intValue();
            }
        }

        int insuranceValue = 0;
        if (finalAmount != null) {
            insuranceValue = finalAmount.intValue();
            if (insuranceValue > 5_000_000) {
                insuranceValue = 5_000_000;
            }
        }

        GHNCreateOrderRequestDTO request = GHNCreateOrderRequestDTO.builder()
                .fromDistrictId(fromDistrictId)
                .toDistrictId(shippingAddress.getDistrictId())
                .toWardCode(shippingAddress.getWardCode())
                .toName(shippingAddress.getRecipientName())
                .toPhone(shippingAddress.getPhoneNumber())
                .toAddress(shippingAddress.getAddress())
                .weight(totalWeight)
                .length(10)
                .width(10)
                .height(10)
                .serviceId(serviceId)
                .insuranceValue(insuranceValue)
                .codAmount(codAmount)
                .note(order.getNotes())
                .items(items)
                .clientOrderCode(order.getIdOrder() != null ? String.valueOf(order.getIdOrder()) : null)
                .build();

        GHNCreateOrderResponseDTO response = ghnService.createOrder(request);

        if (response == null || response.getOrderCode() == null) {
            throw new RuntimeException("Tạo đơn hàng GHN thất bại: không nhận được order_code");
        }

        shipment.setGhnOrderCode(response.getOrderCode());

        try {
            GHNOrderInfoDTO orderInfo = ghnService.getOrderInfo(response.getOrderCode());
            if (orderInfo != null) {
                shipment.setGhnStatus(orderInfo.getStatus());

                if (orderInfo.getExpectedDeliveryTime() != null) {
                    LocalDateTime expected = parseExpectedDeliveryTime(orderInfo.getExpectedDeliveryTime());
                    shipment.setGhnExpectedDeliveryTime(expected);
                }

                if (orderInfo.getTotalFee() != null) {
                    shipment.setGhnShippingFee(BigDecimal.valueOf(orderInfo.getTotalFee()));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch GHN order info after create. Shipment will still be saved with order code only.", e);
        }

        shipment.setGhnUpdatedAt(LocalDateTime.now());

        Shipment savedShipment = shipmentRepository.save(shipment);

        log.info("GHN shipment created successfully for order ID: {}, shipment ID: {}, ghnOrderCode={}",
                orderId, savedShipment.getIdShipment(), savedShipment.getGhnOrderCode());

        return shipmentMapper.toDTO(savedShipment);
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

    private LocalDateTime parseExpectedDeliveryTime(String expectedDeliveryTime) {
        if (expectedDeliveryTime == null || expectedDeliveryTime.isEmpty()) {
            return null;
        }

        try {
            OffsetDateTime odt = OffsetDateTime.parse(expectedDeliveryTime);
            return odt.toLocalDateTime();
        } catch (Exception e) {
            log.warn("Failed to parse GHN expected_delivery_time: {}", expectedDeliveryTime, e);
            return null;
        }
    }
}

