package com.storemanagement.service;

import com.storemanagement.dto.ghn.GHNTrackingDTO;
import com.storemanagement.dto.shipment.ShipmentDTO;

/**
 * Service interface cho Shipment
 * 
 * Mục đích:
 * - Quản lý shipment (vận đơn)
 * - Đồng bộ với GHN API
 * - Tracking đơn hàng
 */
public interface ShipmentService {
    
    /**
     * Lấy thông tin shipment theo ID
     * 
     * @param shipmentId ID shipment
     * @return ShipmentDTO
     */
    ShipmentDTO getShipmentById(Integer shipmentId);
    
    /**
     * Lấy thông tin shipment theo order ID
     * 
     * @param orderId ID đơn hàng
     * @return ShipmentDTO
     */
    ShipmentDTO getShipmentByOrderId(Integer orderId);
    
    /**
     * Đồng bộ trạng thái với GHN API
     * 
     * Logic:
     * 1. Lấy shipment từ database
     * 2. Gọi GHN API để lấy thông tin mới nhất
     * 3. Cập nhật shipment với thông tin từ GHN
     * 4. Sync shippingStatus và Order.status
     * 
     * @param shipmentId ID shipment
     * @return ShipmentDTO đã được cập nhật
     */
    ShipmentDTO syncWithGHN(Integer shipmentId);
    
    /**
     * Lấy thông tin tracking từ GHN
     * 
     * Logic:
     * 1. Lấy shipment từ database
     * 2. Gọi GHN API để lấy tracking info
     * 3. Trả về GHNTrackingDto với lịch sử cập nhật trạng thái
     * 
     * @param shipmentId ID shipment
     * @return GHNTrackingDTO chứa thông tin tracking
     */
    GHNTrackingDTO getShipmentTracking(Integer shipmentId);
}

















