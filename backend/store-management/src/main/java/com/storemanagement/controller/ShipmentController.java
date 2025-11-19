package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.ghn.GHNTrackingDTO;
import com.storemanagement.dto.shipment.ShipmentDTO;
import com.storemanagement.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Slf4j
public class ShipmentController {
    
    private final ShipmentService shipmentService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ShipmentDTO>> getShipmentById(@PathVariable Integer id) {
        log.info("Getting shipment by ID: {}", id);
        ShipmentDTO shipment = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vận đơn thành công", shipment));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ShipmentDTO>> getShipmentByOrderId(@PathVariable Integer orderId) {
        log.info("Getting shipment by order ID: {}", orderId);
        ShipmentDTO shipment = shipmentService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vận đơn thành công", shipment));
    }

    @GetMapping("/{id}/track")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<GHNTrackingDTO>> trackShipment(@PathVariable Integer id) {
        log.info("Tracking shipment: shipmentId={}", id);
        GHNTrackingDTO tracking = shipmentService.getShipmentTracking(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tracking thành công", tracking));
    }

    @PostMapping("/{id}/sync-ghn")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ShipmentDTO>> syncWithGHN(@PathVariable Integer id) {
        log.info("Syncing shipment with GHN: shipmentId={}", id);
        ShipmentDTO shipment = shipmentService.syncWithGHN(id);
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ với GHN thành công", shipment));
    }
}