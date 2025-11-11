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

/**
 * REST Controller cho Shipment (Vận đơn)
 * 
 * Mục đích:
 * - Quản lý shipment
 * - Tracking đơn hàng
 * - Đồng bộ với GHN
 * 
 * Base URL: /api/v1/shipments
 */
@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Slf4j
public class ShipmentController {
    
    private final ShipmentService shipmentService;
    
    /**
     * Lấy thông tin shipment theo ID
     * 
     * Endpoint: GET /api/v1/shipments/{id}
     * 
     * Logic:
     * 1. Gọi ShipmentService.getShipmentById(id)
     * 2. Trả về ShipmentDTO
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ShipmentDTO>> getShipmentById(@PathVariable Integer id) {
        log.info("Getting shipment by ID: {}", id);
        ShipmentDTO shipment = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vận đơn thành công", shipment));
    }
    
    /**
     * Lấy thông tin shipment theo order ID
     * 
     * Endpoint: GET /api/v1/shipments/order/{orderId}
     * 
     * Logic:
     * 1. Gọi ShipmentService.getShipmentByOrderId(orderId)
     * 2. Trả về ShipmentDTO
     */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ShipmentDTO>> getShipmentByOrderId(@PathVariable Integer orderId) {
        log.info("Getting shipment by order ID: {}", orderId);
        ShipmentDTO shipment = shipmentService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vận đơn thành công", shipment));
    }
    
    /**
     * Theo dõi vận đơn
     * 
     * Endpoint: GET /api/v1/shipments/{id}/track
     * 
     * Logic:
     * 1. Gọi ShipmentService.getShipmentTracking(id)
     * 2. Trả về GHNTrackingDTO với lịch sử cập nhật trạng thái
     * 
     * Sử dụng:
     * - Hiển thị lịch sử tracking cho khách hàng
     * - Xem chi tiết trạng thái vận chuyển
     */
    @GetMapping("/{id}/track")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<GHNTrackingDTO>> trackShipment(@PathVariable Integer id) {
        log.info("Tracking shipment: shipmentId={}", id);
        GHNTrackingDTO tracking = shipmentService.getShipmentTracking(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tracking thành công", tracking));
    }
    
    /**
     * Đồng bộ với GHN
     * 
     * Endpoint: POST /api/v1/shipments/{id}/sync-ghn
     * 
     * Logic:
     * 1. Gọi ShipmentService.syncWithGHN(id)
     * 2. Service sẽ:
     *    - Gọi GHN API để lấy thông tin mới nhất
     *    - Cập nhật shipment với thông tin từ GHN
     *    - Sync shippingStatus và Order.status
     * 3. Trả về ShipmentDTO đã được cập nhật
     * 
     * Sử dụng:
     * - Đồng bộ thủ công khi cần
     * - Cập nhật trạng thái từ GHN API
     */
    @PostMapping("/{id}/sync-ghn")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ShipmentDTO>> syncWithGHN(@PathVariable Integer id) {
        log.info("Syncing shipment with GHN: shipmentId={}", id);
        ShipmentDTO shipment = shipmentService.syncWithGHN(id);
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ với GHN thành công", shipment));
    }
}

















