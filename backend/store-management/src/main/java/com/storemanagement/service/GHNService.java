package com.storemanagement.service;

import com.storemanagement.dto.ghn.*;

import java.util.List;

public interface GHNService {

    List<GHNProvinceDTO> getProvinces();

    List<GHNDistrictDTO> getDistricts(Integer provinceId);

    List<GHNWardDTO> getWards(Integer districtId);

    GHNCalculateFeeResponseDTO calculateShippingFee(GHNCalculateFeeRequestDTO request);

    GHNCreateOrderResponseDTO createOrder(GHNCreateOrderRequestDTO request);

    String createGHNOrder(com.storemanagement.model.Order order,
            com.storemanagement.model.ShippingAddress shippingAddress);

    GHNOrderInfoDTO getOrderInfo(String ghnOrderCode);

    void cancelOrder(String ghnOrderCode, String reason);

    List<GHNServiceDTO> getShippingServices(Integer fromDistrictId, Integer toDistrictId);

    String getExpectedDeliveryTime(GHNExpectedDeliveryTimeRequestDTO request);

    GHNTrackingDTO trackOrder(String ghnOrderCode);

    byte[] printOrder(String ghnOrderCode);

    void updateOrder(GHNUpdateOrderRequestDTO request);

    boolean isEnabled();
}
