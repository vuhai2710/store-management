package com.storemanagement.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.config.GHNConfig;
import com.storemanagement.dto.ghn.*;
import com.storemanagement.dto.ghn.GHNExpectedDeliveryTimeResponseDto;
import com.storemanagement.service.GHNService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Service implementation cho GHN (Giao Hàng Nhanh) API Integration
 * 
 * Mục đích:
 * - Implement các method để tương tác với GHN API
 * - Xử lý tính phí vận chuyển, tạo đơn hàng, tracking, etc.
 * 
 * GHN API Documentation: https://api.ghn.vn/
 * GHN Sandbox: https://dev-online-gateway.ghn.vn
 * 
 * Logic chung:
 * 1. Kiểm tra GHN enabled (feature flag)
 * 2. Build request với headers (Token, Shop ID)
 * 3. Gọi GHN API
 * 4. Parse response và xử lý lỗi
 * 5. Return DTO
 */
@Service
@Slf4j
public class GHNServiceImpl implements GHNService {
    
    private final GHNConfig ghnConfig;
    private final RestTemplate ghnRestTemplate;
    private final ObjectMapper objectMapper;
    
    public GHNServiceImpl(GHNConfig ghnConfig, 
                         @Qualifier("ghnRestTemplate") RestTemplate ghnRestTemplate,
                         ObjectMapper objectMapper) {
        this.ghnConfig = ghnConfig;
        this.ghnRestTemplate = ghnRestTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Build headers chung cho tất cả GHN API requests
     * 
     * Headers bắt buộc:
     * - Token: API token từ GHNConfig
     * - ShopId: Shop ID từ GHNConfig
     * - Content-Type: application/json
     */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnConfig.getToken());
        headers.set("ShopId", String.valueOf(ghnConfig.getShopId()));
        return headers;
    }
    
    /**
     * Kiểm tra GHN integration có được bật không
     * 
     * Nếu disabled, các method sẽ throw exception hoặc return default values
     */
    @Override
    public boolean isEnabled() {
        return ghnConfig.getEnabled() != null && ghnConfig.getEnabled();
    }
    
    /**
     * Lấy danh sách tỉnh/thành phố
     * 
     * Endpoint: GET /shiip/public-api/master-data/province
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API GET /shiip/public-api/master-data/province
     * 3. Parse response và trả về danh sách tỉnh/thành phố
     */
    @Override
    public List<GHNProvinceDto> getProvinces() {
        log.info("Getting provinces from GHN API");
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/master-data/province";
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<GHNBaseResponseDto<List<GHNProvinceDto>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<List<GHNProvinceDto>>>() {}
            );
            
            GHNBaseResponseDto<List<GHNProvinceDto>> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to get provinces from GHN: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully got {} provinces from GHN", 
                responseBody.getData() != null ? responseBody.getData().size() : 0);
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to get provinces", e);
            throw new RuntimeException("Failed to get provinces from GHN: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy danh sách quận/huyện theo tỉnh/thành phố
     * 
     * Endpoint: GET /shiip/public-api/master-data/district?province_id={id}
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API với province_id parameter
     * 3. Parse response và trả về danh sách quận/huyện
     */
    @Override
    public List<GHNDistrictDto> getDistricts(Integer provinceId) {
        log.info("Getting districts from GHN API for province ID: {}", provinceId);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/master-data/district?province_id=" + provinceId;
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<GHNBaseResponseDto<List<GHNDistrictDto>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<List<GHNDistrictDto>>>() {}
            );
            
            GHNBaseResponseDto<List<GHNDistrictDto>> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to get districts from GHN: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully got {} districts from GHN", 
                responseBody.getData() != null ? responseBody.getData().size() : 0);
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to get districts", e);
            throw new RuntimeException("Failed to get districts from GHN: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy danh sách phường/xã theo quận/huyện
     * 
     * Endpoint: GET /shiip/public-api/master-data/ward?district_id={id}
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API với district_id parameter
     * 3. Parse response và trả về danh sách phường/xã
     */
    @Override
    public List<GHNWardDto> getWards(Integer districtId) {
        log.info("Getting wards from GHN API for district ID: {}", districtId);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/master-data/ward?district_id=" + districtId;
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<GHNBaseResponseDto<List<GHNWardDto>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<List<GHNWardDto>>>() {}
            );
            
            GHNBaseResponseDto<List<GHNWardDto>> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to get wards from GHN: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully got {} wards from GHN", 
                responseBody.getData() != null ? responseBody.getData().size() : 0);
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to get wards", e);
            throw new RuntimeException("Failed to get wards from GHN: " + e.getMessage(), e);
        }
    }
    
    /**
     * Tính phí vận chuyển
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/fee
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Build request body từ GHNCalculateFeeRequestDto
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/fee
     * 4. Parse response và trả về GHNCalculateFeeResponseDto
     * 5. Response chứa total (tổng phí vận chuyển) và các phí chi tiết
     */
    @Override
    public GHNCalculateFeeResponseDto calculateShippingFee(GHNCalculateFeeRequestDto request) {
        log.info("Calculating shipping fee from GHN API: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled, returning default fee");
            // Return default fee if disabled
            return GHNCalculateFeeResponseDto.builder()
                .total(java.math.BigDecimal.valueOf(30000)) // Default 30,000 VND
                .serviceFee(java.math.BigDecimal.valueOf(25000))
                .insuranceFee(java.math.BigDecimal.ZERO)
                .pickStationFee(java.math.BigDecimal.ZERO)
                .courierStationFee(java.math.BigDecimal.ZERO)
                .codFee(java.math.BigDecimal.ZERO)
                .returnFee(java.math.BigDecimal.ZERO)
                .r2sFee(java.math.BigDecimal.ZERO)
                .build();
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/fee";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNCalculateFeeRequestDto> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDto<GHNCalculateFeeResponseDto>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<GHNCalculateFeeResponseDto>>() {}
            );
            
            GHNBaseResponseDto<GHNCalculateFeeResponseDto> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to calculate shipping fee from GHN: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully calculated shipping fee: {} VND", 
                responseBody.getData() != null && responseBody.getData().getTotal() != null 
                    ? responseBody.getData().getTotal() : "N/A");
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to calculate shipping fee", e);
            throw new RuntimeException("Failed to calculate shipping fee from GHN: " + e.getMessage(), e);
        }
    }
    
    /**
     * Tạo đơn hàng GHN
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/create
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Build request body từ GHNCreateOrderRequestDto
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/create
     * 4. Parse response và trả về GHNCreateOrderResponseDto
     * 5. Response chứa order_code (quan trọng, dùng để tracking)
     * 6. order_code được lưu vào Shipment.ghnOrderCode
     */
    @Override
    public GHNCreateOrderResponseDto createOrder(GHNCreateOrderRequestDto request) {
        log.info("Creating GHN order: clientOrderCode={}, toName={}, toPhone={}", 
            request.getClientOrderCode(), request.getToName(), request.getToPhone());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled, cannot create order");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/create";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNCreateOrderRequestDto> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDto<GHNCreateOrderResponseDto>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<GHNCreateOrderResponseDto>>() {}
            );
            
            GHNBaseResponseDto<GHNCreateOrderResponseDto> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to create GHN order: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully created GHN order: orderCode={}", 
                responseBody.getData() != null ? responseBody.getData().getOrderCode() : "N/A");
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to create order", e);
            throw new RuntimeException("Failed to create GHN order: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy thông tin đơn hàng từ GHN
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/detail
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API GET /shiip/public-api/v2/shipping-order/detail?order_code={code}
     * 3. Parse response và trả về GHNOrderInfoDto
     */
    @Override
    public GHNOrderInfoDto getOrderInfo(String ghnOrderCode) {
        log.info("Getting GHN order info: orderCode={}", ghnOrderCode);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/detail?order_code=" + ghnOrderCode;
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<GHNBaseResponseDto<GHNOrderInfoDto>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<GHNOrderInfoDto>>() {}
            );
            
            GHNBaseResponseDto<GHNOrderInfoDto> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to get GHN order info: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to get order info", e);
            throw new RuntimeException("Failed to get GHN order info: " + e.getMessage(), e);
        }
    }
    
    /**
     * Hủy đơn hàng GHN
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/cancel
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Build request body với order_code và reason
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/cancel
     * 4. Xử lý response (thường chỉ cần check code == 200)
     */
    @Override
    public void cancelOrder(String ghnOrderCode, String reason) {
        log.info("Cancelling GHN order: orderCode={}, reason={}", ghnOrderCode, reason);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/cancel";
            HttpHeaders headers = buildHeaders();
            
            // Build request body
            java.util.Map<String, String> requestBody = new java.util.HashMap<>();
            requestBody.put("order_code", ghnOrderCode);
            if (reason != null && !reason.isEmpty()) {
                requestBody.put("reason", reason);
            }
            
            HttpEntity<java.util.Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(requestBody));
            
            ResponseEntity<GHNBaseResponseDto<Object>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<Object>>() {}
            );
            
            GHNBaseResponseDto<Object> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to cancel GHN order: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully cancelled GHN order: orderCode={}", ghnOrderCode);
            
        } catch (Exception e) {
            log.error("Error calling GHN API to cancel order", e);
            throw new RuntimeException("Failed to cancel GHN order: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy danh sách dịch vụ vận chuyển có sẵn
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/available-services
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API với from_district_id và to_district_id
     * 3. Parse response và trả về danh sách dịch vụ
     */
    @Override
    public List<GHNServiceDto> getShippingServices(Integer fromDistrictId, Integer toDistrictId) {
        log.info("Getting shipping services from GHN: fromDistrictId={}, toDistrictId={}", 
            fromDistrictId, toDistrictId);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/available-services" +
                "?from_district=" + fromDistrictId + "&to_district=" + toDistrictId;
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<GHNBaseResponseDto<List<GHNServiceDto>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<List<GHNServiceDto>>>() {}
            );
            
            GHNBaseResponseDto<List<GHNServiceDto>> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to get shipping services from GHN: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to get shipping services", e);
            throw new RuntimeException("Failed to get shipping services from GHN: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy thời gian giao hàng dự kiến
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/leadtime
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Build request body từ GHNExpectedDeliveryTimeRequestDto
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/leadtime
     * 4. Parse response và trả về thời gian giao hàng dự kiến (ISO 8601 datetime string)
     */
    @Override
    public String getExpectedDeliveryTime(GHNExpectedDeliveryTimeRequestDto request) {
        log.info("Getting expected delivery time from GHN: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/leadtime";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNExpectedDeliveryTimeRequestDto> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDto<GHNExpectedDeliveryTimeResponseDto>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<GHNExpectedDeliveryTimeResponseDto>>() {}
            );
            
            GHNBaseResponseDto<GHNExpectedDeliveryTimeResponseDto> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to get expected delivery time from GHN: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            return responseBody.getData() != null ? responseBody.getData().getLeadtime() : null;
            
        } catch (Exception e) {
            log.error("Error calling GHN API to get expected delivery time", e);
            throw new RuntimeException("Failed to get expected delivery time from GHN: " + e.getMessage(), e);
        }
    }
    
    /**
     * Theo dõi đơn hàng
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/tracking
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API GET /shiip/public-api/v2/shipping-order/tracking?order_code={code}
     * 3. Parse response và trả về GHNTrackingDto với lịch sử cập nhật trạng thái
     */
    @Override
    public GHNTrackingDto trackOrder(String ghnOrderCode) {
        log.info("Tracking GHN order: orderCode={}", ghnOrderCode);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/tracking?order_code=" + ghnOrderCode;
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<GHNBaseResponseDto<GHNTrackingDto>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<GHNTrackingDto>>() {}
            );
            
            GHNBaseResponseDto<GHNTrackingDto> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to track GHN order: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            return responseBody.getData();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to track order", e);
            throw new RuntimeException("Failed to track GHN order: " + e.getMessage(), e);
        }
    }
    
    /**
     * In vận đơn (PDF)
     * 
     * Endpoint: GET /shiip/public-api/v2/shipping-order/print
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Gọi GHN API GET /shiip/public-api/v2/shipping-order/print?order_code={code}
     * 3. Response là PDF file (byte array)
     * 4. Trả về byte array của PDF
     */
    @Override
    public byte[] printOrder(String ghnOrderCode) {
        log.info("Printing GHN order: orderCode={}", ghnOrderCode);
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/print?order_code=" + ghnOrderCode;
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            log.debug("Calling GHN API: GET {}", url);
            
            ResponseEntity<byte[]> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                byte[].class
            );
            
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Failed to print GHN order: Invalid response");
            }
            
            log.info("Successfully printed GHN order: orderCode={}, PDF size={} bytes", 
                ghnOrderCode, response.getBody().length);
            
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Error calling GHN API to print order", e);
            throw new RuntimeException("Failed to print GHN order: " + e.getMessage(), e);
        }
    }
    
    /**
     * Cập nhật đơn hàng GHN
     * 
     * Endpoint: POST /shiip/public-api/v2/shipping-order/update
     * 
     * Logic:
     * 1. Kiểm tra GHN enabled
     * 2. Build request body từ GHNUpdateOrderRequestDto
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/update
     * 4. Xử lý response (thường chỉ cần check code == 200)
     */
    @Override
    public void updateOrder(GHNUpdateOrderRequestDto request) {
        log.info("Updating GHN order: orderCode={}", request.getOrderCode());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/update";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNUpdateOrderRequestDto> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDto<Object>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDto<Object>>() {}
            );
            
            GHNBaseResponseDto<Object> responseBody = response.getBody();
            
            if (responseBody == null || responseBody.getCode() == null || responseBody.getCode() != 200) {
                log.error("GHN API error: {}", responseBody != null ? responseBody.getMessage() : "Null response");
                throw new RuntimeException("Failed to update GHN order: " + 
                    (responseBody != null ? responseBody.getMessage() : "Null response"));
            }
            
            log.info("Successfully updated GHN order: orderCode={}", request.getOrderCode());
            
        } catch (Exception e) {
            log.error("Error calling GHN API to update order", e);
            throw new RuntimeException("Failed to update GHN order: " + e.getMessage(), e);
        }
    }
}

