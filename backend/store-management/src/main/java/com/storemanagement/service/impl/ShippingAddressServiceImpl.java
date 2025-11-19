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
        // Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        // Map Request DTO to Entity
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

        // Xử lý isDefault: Nếu set làm default, cần unset các địa chỉ default khác
        // Đảm bảo chỉ có một địa chỉ mặc định tại một thời điểm
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            // Tìm tất cả địa chỉ mặc định hiện tại
            List<ShippingAddress> defaultAddresses = shippingAddressRepository
                    .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                    .stream()
                    .toList();

            // Unset tất cả địa chỉ mặc định khác
            defaultAddresses.forEach(addr -> addr.setIsDefault(false));
            shippingAddressRepository.saveAll(defaultAddresses);
        }

        // Lưu địa chỉ mới
        ShippingAddress savedAddress = shippingAddressRepository.save(address);
        return shippingAddressMapper.toDTO(savedAddress);
    }

    @Override
    public ShippingAddressDTO updateAddress(Integer customerId, Integer addressId, UpdateShippingAddressRequestDto request) {
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        // Update fields from Request DTO
        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddress(request.getAddress());

        // Update GHN fields if provided
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
        // Kiểm tra địa chỉ tồn tại và thuộc về customer
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        // Unset tất cả địa chỉ mặc định khác (trừ địa chỉ hiện tại)
        // Đảm bảo chỉ có một địa chỉ mặc định
        List<ShippingAddress> defaultAddresses = shippingAddressRepository
                .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                .stream()
                .filter(addr -> !addr.getIdShippingAddress().equals(addressId))
                .toList();
        defaultAddresses.forEach(addr -> addr.setIsDefault(false));
        shippingAddressRepository.saveAll(defaultAddresses);

        // Set địa chỉ này làm mặc định
        address.setIsDefault(true);
        ShippingAddress savedAddress = shippingAddressRepository.save(address);
        return shippingAddressMapper.toDTO(savedAddress);
    }

    @Override
    public void deleteAddress(Integer customerId, Integer addressId) {
        // Kiểm tra địa chỉ tồn tại và thuộc về customer
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        // Kiểm tra địa chỉ mặc định: Không cho xóa địa chỉ mặc định duy nhất
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            // Đếm số lượng địa chỉ mặc định
            long defaultCount = shippingAddressRepository
                    .findByCustomerIdCustomer(customerId)
                    .stream()
                    .filter(ShippingAddress::getIsDefault)
                    .count();

            // Nếu chỉ có 1 địa chỉ mặc định → Không cho phép xóa
            if (defaultCount == 1) {
                throw new RuntimeException("Không thể xóa địa chỉ mặc định duy nhất");
            }
        }

        // Xóa địa chỉ
        shippingAddressRepository.delete(address);
    }
}

