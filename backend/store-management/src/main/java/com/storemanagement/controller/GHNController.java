package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.ghn.GHNCalculateFeeRequestDTO;
import com.storemanagement.dto.ghn.GHNCalculateFeeResponseDTO;
import com.storemanagement.dto.ghn.GHNCreateOrderRequestDTO;
import com.storemanagement.dto.ghn.GHNCreateOrderResponseDTO;
import com.storemanagement.dto.ghn.GHNDistrictDTO;
import com.storemanagement.dto.ghn.GHNExpectedDeliveryTimeRequestDTO;
import com.storemanagement.dto.ghn.GHNOrderInfoDTO;
import com.storemanagement.dto.ghn.GHNProvinceDTO;
import com.storemanagement.dto.ghn.GHNServiceDTO;
import com.storemanagement.dto.ghn.GHNTrackingDTO;
import com.storemanagement.dto.ghn.GHNUpdateOrderRequestDTO;
import com.storemanagement.dto.ghn.GHNWardDTO;
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

@RestController
@RequestMapping("/api/v1/ghn")
@RequiredArgsConstructor
@Slf4j
public class GHNController {
    
    private final GHNService ghnService;

    @GetMapping("/provinces")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNProvinceDTO>>> getProvinces() {
        log.info("Getting provinces from GHN");
        List<GHNProvinceDTO> provinces = ghnService.getProvinces();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tỉnh/thành phố thành công", provinces));
    }

    @GetMapping("/districts")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNDistrictDTO>>> getDistricts(
            @RequestParam Integer provinceId) {
        log.info("Getting districts from GHN for province ID: {}", provinceId);
        List<GHNDistrictDTO> districts = ghnService.getDistricts(provinceId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quận/huyện thành công", districts));
    }

    @GetMapping("/wards")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNWardDTO>>> getWards(
            @RequestParam Integer districtId) {
        log.info("Getting wards from GHN for district ID: {}", districtId);
        List<GHNWardDTO> wards = ghnService.getWards(districtId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phường/xã thành công", wards));
    }

    @PostMapping("/calculate-fee")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<GHNCalculateFeeResponseDTO>> calculateFee(
            @RequestBody @Valid GHNCalculateFeeRequestDTO request) {
        log.info("Calculating shipping fee from GHN: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        GHNCalculateFeeResponseDTO fee = ghnService.calculateShippingFee(request);
        return ResponseEntity.ok(ApiResponse.success("Tính phí vận chuyển thành công", fee));
    }

    @PostMapping("/create-order")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<GHNCreateOrderResponseDTO>> createOrder(
            @RequestBody @Valid GHNCreateOrderRequestDTO request) {
        log.info("Creating GHN order: clientOrderCode={}", request.getClientOrderCode());
        GHNCreateOrderResponseDTO response = ghnService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng GHN thành công", response));
    }

    @GetMapping("/orders/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<GHNOrderInfoDTO>> getOrderInfo(
            @PathVariable String ghnOrderCode) {
        log.info("Getting GHN order info: orderCode={}", ghnOrderCode);
        GHNOrderInfoDTO orderInfo = ghnService.getOrderInfo(ghnOrderCode);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng GHN thành công", orderInfo));
    }

    @DeleteMapping("/orders/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable String ghnOrderCode,
            @RequestParam(required = false) String reason) {
        log.info("Cancelling GHN order: orderCode={}, reason={}", ghnOrderCode, reason);
        ghnService.cancelOrder(ghnOrderCode, reason);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng GHN thành công", null));
    }

    @GetMapping("/services")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GHNServiceDTO>>> getShippingServices(
            @RequestParam Integer fromDistrictId,
            @RequestParam Integer toDistrictId) {
        log.info("Getting shipping services from GHN: fromDistrictId={}, toDistrictId={}", 
            fromDistrictId, toDistrictId);
        List<GHNServiceDTO> services = ghnService.getShippingServices(fromDistrictId, toDistrictId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách dịch vụ vận chuyển thành công", services));
    }

    @PostMapping("/expected-delivery-time")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> getExpectedDeliveryTime(
            @RequestBody @Valid GHNExpectedDeliveryTimeRequestDTO request) {
        log.info("Getting expected delivery time from GHN: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        String leadtime = ghnService.getExpectedDeliveryTime(request);
        return ResponseEntity.ok(ApiResponse.success("Lấy thời gian giao hàng dự kiến thành công", leadtime));
    }

    @GetMapping("/track/{ghnOrderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<GHNTrackingDTO>> trackOrder(
            @PathVariable String ghnOrderCode) {
        log.info("Tracking GHN order: orderCode={}", ghnOrderCode);
        GHNTrackingDTO tracking = ghnService.trackOrder(ghnOrderCode);
        return ResponseEntity.ok(ApiResponse.success("Theo dõi đơn hàng thành công", tracking));
    }

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

    @PutMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> updateOrder(
            @RequestBody @Valid GHNUpdateOrderRequestDTO request) {
        log.info("Updating GHN order: orderCode={}", request.getOrderCode());
        ghnService.updateOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn hàng GHN thành công", null));
    }
}