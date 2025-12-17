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

            Shipment shipment = shipmentRepository.findByGhnOrderCode(webhookDto.getOrderCode())
                    .orElse(null);

            if (shipment == null) {
                log.warn("Shipment not found for GHN order code: {}. Ignoring webhook.",
                        webhookDto.getOrderCode());

                return ResponseEntity.ok(Map.of("status", "warning",
                        "message", "Shipment not found"));
            }

            log.info("Found shipment ID: {} for GHN order code: {}",
                    shipment.getIdShipment(), webhookDto.getOrderCode());

            shipment.setGhnStatus(webhookDto.getStatus());

            if (webhookDto.getUpdatedAt() != null && !webhookDto.getUpdatedAt().isEmpty()) {
                try {

                    LocalDateTime updatedAt = LocalDateTime.parse(
                            webhookDto.getUpdatedAt(),
                            DateTimeFormatter.ISO_DATE_TIME);
                    shipment.setGhnUpdatedAt(updatedAt);
                } catch (Exception e) {
                    log.warn("Failed to parse updatedAt: {}. Using current time.",
                            webhookDto.getUpdatedAt());
                    shipment.setGhnUpdatedAt(LocalDateTime.now());
                }
            } else {
                shipment.setGhnUpdatedAt(LocalDateTime.now());
            }

            if (webhookDto.getNote() != null && !webhookDto.getNote().isEmpty()) {
                shipment.setGhnNote(webhookDto.getNote());
            }

            syncShippingStatus(shipment, webhookDto.getStatus());

            shipmentRepository.save(shipment);

            syncOrderStatus(shipment.getOrder(), webhookDto.getStatus());

            log.info("Successfully processed GHN webhook for order code: {}. New status: {}",
                    webhookDto.getOrderCode(), webhookDto.getStatus());

            return ResponseEntity.ok(Map.of("status", "success",
                    "message", "Webhook processed"));

        } catch (Exception e) {
            log.error("Error processing GHN webhook", e);

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

            if (order.getStatus() != Order.OrderStatus.COMPLETED) {
                LocalDateTime now = LocalDateTime.now();
                log.info("Updating order status to COMPLETED. Order ID: {}", order.getIdOrder());
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setDeliveredAt(now);
                order.setCompletedAt(now);

                int returnWindowDays = systemSettingService.getReturnWindowDays();
                order.setReturnWindowDays(returnWindowDays);
                log.info("Order COMPLETED: completedAt={}, returnWindowDays={} for order: {}", now, returnWindowDays,
                        order.getIdOrder());
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
