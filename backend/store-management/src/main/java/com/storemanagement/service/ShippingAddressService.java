package com.storemanagement.service;

import com.storemanagement.dto.shipment.ShippingAddressDTO;
import com.storemanagement.dto.shipment.CreateShippingAddressRequestDto;
import com.storemanagement.dto.shipment.UpdateShippingAddressRequestDto;

import java.util.List;

public interface ShippingAddressService {
    List<ShippingAddressDTO> getAllAddresses(Integer customerId);
    
    ShippingAddressDTO getDefaultAddress(Integer customerId);
    
    ShippingAddressDTO createAddress(Integer customerId, CreateShippingAddressRequestDto request);
    
    ShippingAddressDTO updateAddress(Integer customerId, Integer addressId, UpdateShippingAddressRequestDto request);
    
    ShippingAddressDTO setDefaultAddress(Integer customerId, Integer addressId);
    
    void deleteAddress(Integer customerId, Integer addressId);
}




