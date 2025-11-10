package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.ghn.*;
import com.storemanagement.service.GHNService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho GHN (Giao Hàng Nhanh) API Integration
 * 
 * Mục đích:
 * - Cung cấp các REST endpoints để tương tác với GHN API
 * - Tính phí vận chuyển, tạo đơn hàng, tracking, etc.
 * 
 * Tất cả endpoints yêu cầu authentication (ADMIN hoặc EMPLOYEE role)
 * 
 * Base URL: /api/v1/ghn
 */
@RestController
@RequestMapping("/api/v1/ghn")
@RequiredArgsConstructor
@Slf4j
public class GHNController {
    
    private final GHNService ghnService;
    
    /**
     * Lấy danh sách tỉnh/thành phố
     * 
     * Endpoint: GET /api/v1/ghn/provinces
     * 
     * Logic:
     * 1. Gọi GHNService.getProvinces()
     * 2. Trả về danh sách tỉnh/thành phố từ GHN API
     * 
     * Sử dụng:
     * - Hiển thị dropdown tỉnh/thành phố trong form địa chỉ
     * - Lấy danh sách để mapping với ShippingAddress
     */
    @GetMapping("/provinces")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNProvinceDto>>> getProvinces() {
        log.info("Getting provinces from GHN");
        List<GHNProvinceDto> provinces = ghnService.getProvinces();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tỉnh/thành phố thành công", provinces));
    }
    
    /**
     * Lấy danh sách quận/huyện theo tỉnh/thành phố
     * 
     * Endpoint: GET /api/v1/ghn/districts?provinceId={id}
     * 
     * Logic:
     * 1. Nhận provinceId từ query parameter
     * 2. Gọi GHNService.getDistricts(provinceId)
     * 3. Trả về danh sách quận/huyện từ GHN API
     * 
     * Sử dụng:
     * - Hiển thị dropdown quận/huyện sau khi chọn tỉnh/thành phố
     */
    @GetMapping("/districts")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNDistrictDto>>> getDistricts(
            @RequestParam Integer provinceId) {
        log.info("Getting districts from GHN for province ID: {}", provinceId);
        List<GHNDistrictDto> districts = ghnService.getDistricts(provinceId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quận/huyện thành công", districts));
    }
    
    /**
     * Lấy danh sách phường/xã theo quận/huyện
     * 
     * Endpoint: GET /api/v1/ghn/wards?districtId={id}
     * 
     * Logic:
     * 1. Nhận districtId từ query parameter
     * 2. Gọi GHNService.getWards(districtId)
     * 3. Trả về danh sách phường/xã từ GHN API
     * 
     * Sử dụng:
     * - Hiển thị dropdown phường/xã sau khi chọn quận/huyện
     */
    @GetMapping("/wards")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNWardDto>>> getWards(
            @RequestParam Integer districtId) {
        log.info("Getting wards from GHN for district ID: {}", districtId);
        List<GHNWardDto> wards = ghnService.getWards(districtId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phường/xã thành công", wards));
    }
    
    /**
     * Tính phí vận chuyển
     * 
     * Endpoint: POST /api/v1/ghn/calculate-fee
     * 
     * Logic:
     * 1. Nhận GHNCalculateFeeRequestDto từ request body
     * 2. Gọi GHNService.calculateShippingFee(request)
     * 3. Trả về GHNCalculateFeeResponseDto chứa tổng phí vận chuyển
     * 
     * Sử dụng:
     * - Tính phí vận chuyển trước khi tạo đơn hàng
     * - Hiển thị phí vận chuyển cho khách hàng trong checkout
     */
    @PostMapping("/calculate-fee")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<GHNCalculateFeeResponseDto>> calculateFee(
            @RequestBody @Valid GHNCalculateFeeRequestDto request) {
        log.info("Calculating shipping fee from GHN: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        GHNCalculateFeeResponseDto fee = ghnService.calculateShippingFee(request);
        return ResponseEntity.ok(ApiResponse.success("Tính phí vận chuyển thành công", fee));
    }
    
    /**
     * Tạo đơn hàng GHN
     * 
     * Endpoint: POST /api/v1/ghn/create-order
     * 
     * Logic:
     * 1. Nhận GHNCreateOrderRequestDto từ request body
     * 2. Gọi GHNService.createOrder(request)
     * 3. Trả về GHNCreateOrderResponseDto chứa order_code
     * 4. order_code được lưu vào Shipment.ghnOrderCode
     * 
     * Sử dụng:
     * - Tạo đơn hàng vận chuyển trên GHN sau khi tạo Order trong hệ thống
     * - Tự động gọi từ OrderService khi tạo order với shippingMethod = GHN
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<GHNCreateOrderResponseDto>> createOrder(
            @RequestBody @Valid GHNCreateOrderRequestDto request) {
        log.info("Creating GHN order: clientOrderCode={}", request.getClientOrderCode());
        GHNCreateOrderResponseDto response = ghnService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng GHN thành công", response));
    }
    
    /**
     * Lấy thông tin đơn hàng từ GHN
     * 
     * Endpoint: GET /api/v1/ghn/orders/{ghnOrderCode}
     * 
     * Logic:
     * 1. Nhận ghnOrderCode từ path variable
     * 2. Gọi GHNService.getOrderInfo(ghnOrderCode)
     * 3. Trả về GHNOrderInfoDto chứa thông tin đơn hàng
     * 
     * Sử dụng:
     * - Xem chi tiết đơn hàng vận chuyển từ GHN
     * - Kiểm tra trạng thái đơn hàng
     */
    @GetMapping("/orders/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<GHNOrderInfoDto>> getOrderInfo(
            @PathVariable String ghnOrderCode) {
        log.info("Getting GHN order info: orderCode={}", ghnOrderCode);
        GHNOrderInfoDto orderInfo = ghnService.getOrderInfo(ghnOrderCode);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng GHN thành công", orderInfo));
    }
    
    /**
     * Hủy đơn hàng GHN
     * 
     * Endpoint: DELETE /api/v1/ghn/orders/{ghnOrderCode}
     * 
     * Logic:
     * 1. Nhận ghnOrderCode từ path variable
     * 2. Nhận reason từ query parameter (optional)
     * 3. Gọi GHNService.cancelOrder(ghnOrderCode, reason)
     * 
     * Sử dụng:
     * - Hủy đơn hàng vận chuyển trên GHN khi order bị hủy
     */
    @DeleteMapping("/orders/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable String ghnOrderCode,
            @RequestParam(required = false) String reason) {
        log.info("Cancelling GHN order: orderCode={}, reason={}", ghnOrderCode, reason);
        ghnService.cancelOrder(ghnOrderCode, reason);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng GHN thành công", null));
    }
    
    /**
     * Lấy danh sách dịch vụ vận chuyển có sẵn
     * 
     * Endpoint: GET /api/v1/ghn/services?fromDistrictId={id}&toDistrictId={id}
     * 
     * Logic:
     * 1. Nhận fromDistrictId và toDistrictId từ query parameters
     * 2. Gọi GHNService.getShippingServices(fromDistrictId, toDistrictId)
     * 3. Trả về danh sách dịch vụ vận chuyển
     * 
     * Sử dụng:
     * - Hiển thị các dịch vụ vận chuyển có sẵn cho khách hàng chọn
     */
    @GetMapping("/services")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNServiceDto>>> getShippingServices(
            @RequestParam Integer fromDistrictId,
            @RequestParam Integer toDistrictId) {
        log.info("Getting shipping services from GHN: fromDistrictId={}, toDistrictId={}", 
            fromDistrictId, toDistrictId);
        List<GHNServiceDto> services = ghnService.getShippingServices(fromDistrictId, toDistrictId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách dịch vụ vận chuyển thành công", services));
    }
    
    /**
     * Lấy thời gian giao hàng dự kiến
     * 
     * Endpoint: POST /api/v1/ghn/expected-delivery-time
     * 
     * Logic:
     * 1. Nhận GHNExpectedDeliveryTimeRequestDto từ request body
     * 2. Gọi GHNService.getExpectedDeliveryTime(request)
     * 3. Trả về thời gian giao hàng dự kiến (ISO 8601 datetime string)
     * 
     * Sử dụng:
     * - Hiển thị thời gian giao hàng dự kiến cho khách hàng
     * - Lưu vào Shipment.ghnExpectedDeliveryTime
     */
    @PostMapping("/expected-delivery-time")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> getExpectedDeliveryTime(
            @RequestBody @Valid GHNExpectedDeliveryTimeRequestDto request) {
        log.info("Getting expected delivery time from GHN: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        String leadtime = ghnService.getExpectedDeliveryTime(request);
        return ResponseEntity.ok(ApiResponse.success("Lấy thời gian giao hàng dự kiến thành công", leadtime));
    }
    
    /**
     * Theo dõi đơn hàng
     * 
     * Endpoint: GET /api/v1/ghn/track/{ghnOrderCode}
     * 
     * Logic:
     * 1. Nhận ghnOrderCode từ path variable
     * 2. Gọi GHNService.trackOrder(ghnOrderCode)
     * 3. Trả về GHNTrackingDto chứa lịch sử cập nhật trạng thái
     * 
     * Sử dụng:
     * - Hiển thị lịch sử tracking cho khách hàng
     * - Đồng bộ trạng thái với Shipment
     */
    @GetMapping("/track/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<GHNTrackingDto>> trackOrder(
            @PathVariable String ghnOrderCode) {
        log.info("Tracking GHN order: orderCode={}", ghnOrderCode);
        GHNTrackingDto tracking = ghnService.trackOrder(ghnOrderCode);
        return ResponseEntity.ok(ApiResponse.success("Theo dõi đơn hàng thành công", tracking));
    }
    
    /**
     * In vận đơn (PDF)
     * 
     * Endpoint: GET /api/v1/ghn/print/{ghnOrderCode}
     * 
     * Logic:
     * 1. Nhận ghnOrderCode từ path variable
     * 2. Gọi GHNService.printOrder(ghnOrderCode)
     * 3. Trả về PDF file (byte array)
     * 
     * Sử dụng:
     * - In vận đơn cho shipper
     * - Download vận đơn PDF
     */
    @GetMapping("/print/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<byte[]> printOrder(@PathVariable String ghnOrderCode) {
        log.info("Printing GHN order: orderCode={}", ghnOrderCode);
        byte[] pdfBytes = ghnService.printOrder(ghnOrderCode);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "van-don-" + ghnOrderCode + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    
    /**
     * Cập nhật đơn hàng GHN
     * 
     * Endpoint: PUT /api/v1/ghn/orders
     * 
     * Logic:
     * 1. Nhận GHNUpdateOrderRequestDto từ request body
     * 2. Gọi GHNService.updateOrder(request)
     * 
     * Sử dụng:
     * - Cập nhật thông tin đơn hàng vận chuyển (địa chỉ, số điện thoại, ghi chú)
     */
    @PutMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> updateOrder(
            @RequestBody @Valid GHNUpdateOrderRequestDto request) {
        log.info("Updating GHN order: orderCode={}", request.getOrderCode());
        ghnService.updateOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn hàng GHN thành công", null));
    }
}










