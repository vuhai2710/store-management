package com.storemanagement.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.config.GHNConfig;
import com.storemanagement.dto.ghn.*;
import com.storemanagement.dto.ghn.GHNExpectedDeliveryTimeResponseDTO;
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
    public List<GHNProvinceDTO> getProvinces() {
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
            
            ResponseEntity<GHNBaseResponseDTO<List<GHNProvinceDTO>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<List<GHNProvinceDTO>>>() {}
            );
            
            GHNBaseResponseDTO<List<GHNProvinceDTO>> responseBody = response.getBody();
            
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
    public List<GHNDistrictDTO> getDistricts(Integer provinceId) {
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
            
            ResponseEntity<GHNBaseResponseDTO<List<GHNDistrictDTO>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<List<GHNDistrictDTO>>>() {}
            );
            
            GHNBaseResponseDTO<List<GHNDistrictDTO>> responseBody = response.getBody();
            
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
    public List<GHNWardDTO> getWards(Integer districtId) {
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
            
            ResponseEntity<GHNBaseResponseDTO<List<GHNWardDTO>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<List<GHNWardDTO>>>() {}
            );
            
            GHNBaseResponseDTO<List<GHNWardDTO>> responseBody = response.getBody();
            
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
     * 2. Build request body từ GHNCalculateFeeRequestDTO
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/fee
     * 4. Parse response và trả về GHNCalculateFeeResponseDTO
     * 5. Response chứa total (tổng phí vận chuyển) và các phí chi tiết
     */
    @Override
    public GHNCalculateFeeResponseDTO calculateShippingFee(GHNCalculateFeeRequestDTO request) {
        log.info("Calculating shipping fee from GHN API: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled, returning default fee");
            // Return default fee if disabled
            return GHNCalculateFeeResponseDTO.builder()
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
            HttpEntity<GHNCalculateFeeRequestDTO> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDTO<GHNCalculateFeeResponseDTO>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<GHNCalculateFeeResponseDTO>>() {}
            );
            
            GHNBaseResponseDTO<GHNCalculateFeeResponseDTO> responseBody = response.getBody();
            
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
     * 2. Build request body từ GHNCreateOrderRequestDTO
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/create
     * 4. Parse response và trả về GHNCreateOrderResponseDTO
     * 5. Response chứa order_code (quan trọng, dùng để tracking)
     * 6. order_code được lưu vào Shipment.ghnOrderCode
     */
    @Override
    public GHNCreateOrderResponseDTO createOrder(GHNCreateOrderRequestDTO request) {
        log.info("Creating GHN order: clientOrderCode={}, toName={}, toPhone={}", 
            request.getClientOrderCode(), request.getToName(), request.getToPhone());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled, cannot create order");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/create";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNCreateOrderRequestDTO> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDTO<GHNCreateOrderResponseDTO>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<GHNCreateOrderResponseDTO>>() {}
            );
            
            GHNBaseResponseDTO<GHNCreateOrderResponseDTO> responseBody = response.getBody();
            
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
     * 3. Parse response và trả về GHNOrderInfoDTO
     */
    @Override
    public GHNOrderInfoDTO getOrderInfo(String ghnOrderCode) {
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
            
            ResponseEntity<GHNBaseResponseDTO<GHNOrderInfoDTO>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<GHNOrderInfoDTO>>() {}
            );
            
            GHNBaseResponseDTO<GHNOrderInfoDTO> responseBody = response.getBody();
            
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
            
            ResponseEntity<GHNBaseResponseDTO<Object>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<Object>>() {}
            );
            
            GHNBaseResponseDTO<Object> responseBody = response.getBody();
            
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
    public List<GHNServiceDTO> getShippingServices(Integer fromDistrictId, Integer toDistrictId) {
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
            
            ResponseEntity<GHNBaseResponseDTO<List<GHNServiceDTO>>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<List<GHNServiceDTO>>>() {}
            );
            
            GHNBaseResponseDTO<List<GHNServiceDTO>> responseBody = response.getBody();
            
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
     * 2. Build request body từ GHNExpectedDeliveryTimeRequestDTO
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/leadtime
     * 4. Parse response và trả về thời gian giao hàng dự kiến (ISO 8601 datetime string)
     */
    @Override
    public String getExpectedDeliveryTime(GHNExpectedDeliveryTimeRequestDTO request) {
        log.info("Getting expected delivery time from GHN: fromDistrictId={}, toDistrictId={}", 
            request.getFromDistrictId(), request.getToDistrictId());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/leadtime";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNExpectedDeliveryTimeRequestDTO> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDTO<GHNExpectedDeliveryTimeResponseDTO>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<GHNExpectedDeliveryTimeResponseDTO>>() {}
            );
            
            GHNBaseResponseDTO<GHNExpectedDeliveryTimeResponseDTO> responseBody = response.getBody();
            
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
     * 3. Parse response và trả về GHNTrackingDTO với lịch sử cập nhật trạng thái
     */
    @Override
    public GHNTrackingDTO trackOrder(String ghnOrderCode) {
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
            
            ResponseEntity<GHNBaseResponseDTO<GHNTrackingDTO>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<GHNTrackingDTO>>() {}
            );
            
            GHNBaseResponseDTO<GHNTrackingDTO> responseBody = response.getBody();
            
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
     * 2. Build request body từ GHNUpdateOrderRequestDTO
     * 3. Gọi GHN API POST /shiip/public-api/v2/shipping-order/update
     * 4. Xử lý response (thường chỉ cần check code == 200)
     */
    @Override
    public void updateOrder(GHNUpdateOrderRequestDTO request) {
        log.info("Updating GHN order: orderCode={}", request.getOrderCode());
        
        if (!isEnabled()) {
            log.warn("GHN integration is disabled");
            throw new RuntimeException("GHN integration is disabled");
        }
        
        try {
            String url = ghnConfig.getBaseUrl() + "/shiip/public-api/v2/shipping-order/update";
            HttpHeaders headers = buildHeaders();
            HttpEntity<GHNUpdateOrderRequestDTO> requestEntity = new HttpEntity<>(request, headers);
            
            log.debug("Calling GHN API: POST {}", url);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<GHNBaseResponseDTO<Object>> response = ghnRestTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<GHNBaseResponseDTO<Object>>() {}
            );
            
            GHNBaseResponseDTO<Object> responseBody = response.getBody();
            
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

