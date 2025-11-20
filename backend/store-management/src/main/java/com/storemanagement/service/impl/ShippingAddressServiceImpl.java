package com.storemanagement.service.impl;

import com.storemanagement.dto.shipment.ShippingAddressDTO;
import com.storemanagement.dto.shipment.CreateShippingAddressRequestDto;
import com.storemanagement.dto.shipment.UpdateShippingAddressRequestDto;
import com.storemanagement.mapper.ShippingAddressMapper;
import com.storemanagement.model.Customer;
import com.storemanagement.model.ShippingAddress;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.ShippingAddressRepository;
import com.storemanagement.service.ShippingAddressService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ShippingAddressServiceImpl implements ShippingAddressService {
    private final ShippingAddressRepository shippingAddressRepository;
    private final CustomerRepository customerRepository;
    private final ShippingAddressMapper shippingAddressMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ShippingAddressDTO> getAllAddresses(Integer customerId) {
        List<ShippingAddress> addresses = shippingAddressRepository
                .findByCustomerIdCustomerOrderByIsDefaultDesc(customerId);
        return shippingAddressMapper.toDTOList(addresses);
    }

    @Override
    @Transactional(readOnly = true)
    public ShippingAddressDTO getDefaultAddress(Integer customerId) {
        ShippingAddress defaultAddress = shippingAddressRepository
                .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ mặc định"));
        return shippingAddressMapper.toDTO(defaultAddress);
    }

    @Override
    public ShippingAddressDTO createAddress(Integer customerId, CreateShippingAddressRequestDto request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        ShippingAddress address = ShippingAddress.builder()
                .recipientName(request.getRecipientName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .provinceId(request.getProvinceId())
                .districtId(request.getDistrictId())
                .wardCode(request.getWardCode())
                .customer(customer)
                .build();

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<ShippingAddress> defaultAddresses = shippingAddressRepository
                    .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                    .stream()
                    .toList();

            defaultAddresses.forEach(addr -> addr.setIsDefault(false));
            shippingAddressRepository.saveAll(defaultAddresses);
        }

        ShippingAddress savedAddress = shippingAddressRepository.save(address);
        return shippingAddressMapper.toDTO(savedAddress);
    }

    @Override
    public ShippingAddressDTO updateAddress(Integer customerId, Integer addressId, UpdateShippingAddressRequestDto request) {
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddress(request.getAddress());

        if (request.getProvinceId() != null) {
            address.setProvinceId(request.getProvinceId());
        }
        if (request.getDistrictId() != null) {
            address.setDistrictId(request.getDistrictId());
        }
        if (request.getWardCode() != null) {
            address.setWardCode(request.getWardCode());
        }

        ShippingAddress updatedAddress = shippingAddressRepository.save(address);
        return shippingAddressMapper.toDTO(updatedAddress);
    }

    @Override
    public ShippingAddressDTO setDefaultAddress(Integer customerId, Integer addressId) {
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        List<ShippingAddress> defaultAddresses = shippingAddressRepository
                .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                .stream()
                .filter(addr -> !addr.getIdShippingAddress().equals(addressId))
                .toList();
        defaultAddresses.forEach(addr -> addr.setIsDefault(false));
        shippingAddressRepository.saveAll(defaultAddresses);

        address.setIsDefault(true);
        ShippingAddress savedAddress = shippingAddressRepository.save(address);
        return shippingAddressMapper.toDTO(savedAddress);
    }

    @Override
    public void deleteAddress(Integer customerId, Integer addressId) {
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            long defaultCount = shippingAddressRepository
                    .findByCustomerIdCustomer(customerId)
                    .stream()
                    .filter(ShippingAddress::getIsDefault)
                    .count();

            if (defaultCount == 1) {
                throw new RuntimeException("Không thể xóa địa chỉ mặc định duy nhất");
            }
        }

        shippingAddressRepository.delete(address);
    }
}

