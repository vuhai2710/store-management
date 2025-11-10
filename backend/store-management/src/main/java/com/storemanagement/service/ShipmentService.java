package com.storemanagement.service;

import com.storemanagement.dto.ghn.GHNTrackingDto;
import com.storemanagement.dto.response.ShipmentDto;

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
     * @return ShipmentDto
     */
    ShipmentDto getShipmentById(Integer shipmentId);
    
    /**
     * Lấy thông tin shipment theo order ID
     * 
     * @param orderId ID đơn hàng
     * @return ShipmentDto
     */
    ShipmentDto getShipmentByOrderId(Integer orderId);
    
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
     * @return ShipmentDto đã được cập nhật
     */
    ShipmentDto syncWithGHN(Integer shipmentId);
    
    /**
     * Lấy thông tin tracking từ GHN
     * 
     * Logic:
     * 1. Lấy shipment từ database
     * 2. Gọi GHN API để lấy tracking info
     * 3. Trả về GHNTrackingDto với lịch sử cập nhật trạng thái
     * 
     * @param shipmentId ID shipment
     * @return GHNTrackingDto chứa thông tin tracking
     */
    GHNTrackingDto getShipmentTracking(Integer shipmentId);
}











