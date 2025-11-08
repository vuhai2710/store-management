package com.storemanagement.service;

import com.storemanagement.dto.request.CreateShippingAddressRequestDto;
import com.storemanagement.dto.request.UpdateShippingAddressRequestDto;
import com.storemanagement.dto.response.ShippingAddressDto;

import java.util.List;

public interface ShippingAddressService {
    List<ShippingAddressDto> getAllAddresses(Integer customerId);
    
    ShippingAddressDto getDefaultAddress(Integer customerId);
    
    ShippingAddressDto createAddress(Integer customerId, CreateShippingAddressRequestDto request);
    
    ShippingAddressDto updateAddress(Integer customerId, Integer addressId, UpdateShippingAddressRequestDto request);
    
    ShippingAddressDto setDefaultAddress(Integer customerId, Integer addressId);
    
    void deleteAddress(Integer customerId, Integer addressId);
}




