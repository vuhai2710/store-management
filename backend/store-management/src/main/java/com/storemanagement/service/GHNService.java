package com.storemanagement.service;

import com.storemanagement.dto.ghn.*;

import java.util.List;

/**
 * Service interface cho GHN (Giao Hàng Nhanh) API Integration
 * 
 * Mục đích:
 * - Cung cấp các method để tương tác với GHN API
 * - Tính phí vận chuyển, tạo đơn hàng, tracking, etc.
 * 
 * GHN API Documentation: https://api.ghn.vn/
 * GHN Sandbox: https://dev-online-gateway.ghn.vn
 */
public interface GHNService {
    
    /**
     * Lấy danh sách tỉnh/thành phố
     * 
     * Endpoint: GET /shiip/public-api/master-data/province
     * 
     * @return Danh sách tỉnh/thành phố
     */
    List<GHNProvinceDto> getProvinces();
    
    /**
     * Lấy danh sách quận/huyện theo tỉnh/thành phố
     * 
     * Endpoint: GET /shiip/public-api/master-data/district
     * 
     * @param provinceId ID tỉnh/thành phố
     * @return Danh sách quận/huyện
     */
    List<GHNDistrictDto> getDistricts(Integer provinceId);
    
    /**
     * Lấy danh sách phường/xã theo quận/huyện
     * 
     * Endpoint: GET /shiip/public-api/master-data/ward
     * 
     * @param districtId ID quận/huyện
     * @return Danh sách phường/xã
     */
    List<GHNWardDto> getWards(Integer districtId);
    
    /**
     * Tính phí vận chuyển
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/fee
     * 
     * Logic:
     * 1. Build GHNCalculateFeeRequestDto từ thông tin địa chỉ và đơn hàng
     * 2. Gọi GHN API để tính phí
     * 3. Trả về GHNCalculateFeeResponseDto chứa tổng phí vận chuyển
     * 
     * @param request Request DTO chứa thông tin địa chỉ và đơn hàng
     * @return Response DTO chứa phí vận chuyển
     */
    GHNCalculateFeeResponseDto calculateShippingFee(GHNCalculateFeeRequestDto request);
    
    /**
     * Tạo đơn hàng GHN
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/create
     * 
     * Logic:
     * 1. Build GHNCreateOrderRequestDto từ Order và ShippingAddress
     * 2. Gọi GHN API để tạo đơn hàng
     * 3. Trả về GHNCreateOrderResponseDto chứa order_code
     * 4. order_code được lưu vào Shipment.ghnOrderCode
     * 
     * @param request Request DTO chứa thông tin đơn hàng
     * @return Response DTO chứa order_code và thông tin đơn hàng
     */
    GHNCreateOrderResponseDto createOrder(GHNCreateOrderRequestDto request);
    
    /**
     * Lấy thông tin đơn hàng từ GHN
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/detail
     * 
     * @param ghnOrderCode Mã đơn hàng GHN
     * @return Thông tin đơn hàng
     */
    GHNOrderInfoDto getOrderInfo(String ghnOrderCode);
    
    /**
     * Hủy đơn hàng GHN
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/cancel
     * 
     * @param ghnOrderCode Mã đơn hàng GHN cần hủy
     * @param reason Lý do hủy (optional)
     */
    void cancelOrder(String ghnOrderCode, String reason);
    
    /**
     * Lấy danh sách dịch vụ vận chuyển có sẵn
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/available-services
     * 
     * @param fromDistrictId ID quận/huyện nơi gửi
     * @param toDistrictId ID quận/huyện nơi nhận
     * @return Danh sách dịch vụ vận chuyển
     */
    List<GHNServiceDto> getShippingServices(Integer fromDistrictId, Integer toDistrictId);
    
    /**
     * Lấy thời gian giao hàng dự kiến
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/leadtime
     * 
     * @param request Request DTO chứa thông tin địa chỉ và dịch vụ
     * @return Thời gian giao hàng dự kiến (ISO 8601 datetime string)
     */
    String getExpectedDeliveryTime(GHNExpectedDeliveryTimeRequestDto request);
    
    /**
     * Theo dõi đơn hàng
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/tracking
     * 
     * @param ghnOrderCode Mã đơn hàng GHN
     * @return Thông tin tracking với lịch sử cập nhật trạng thái
     */
    GHNTrackingDto trackOrder(String ghnOrderCode);
    
    /**
     * In vận đơn (PDF)
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/print
     * 
     * @param ghnOrderCode Mã đơn hàng GHN
     * @return Byte array của file PDF vận đơn
     */
    byte[] printOrder(String ghnOrderCode);
    
    /**
     * Cập nhật đơn hàng GHN
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/update
     * 
     * @param request Request DTO chứa thông tin cần cập nhật
     */
    void updateOrder(GHNUpdateOrderRequestDto request);
    
    /**
     * Kiểm tra GHN integration có được bật không
     * 
     * @return true nếu GHN enabled, false nếu disabled
     */
    boolean isEnabled();
}




