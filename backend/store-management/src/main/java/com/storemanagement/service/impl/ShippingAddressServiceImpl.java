package com.storemanagement.service.impl;

import com.storemanagement.dto.request.CreateShippingAddressRequestDto;
import com.storemanagement.dto.response.ShippingAddressDto;
import com.storemanagement.dto.request.UpdateShippingAddressRequestDto;
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
    public List<ShippingAddressDto> getAllAddresses(Integer customerId) {
        List<ShippingAddress> addresses = shippingAddressRepository
                .findByCustomerIdCustomerOrderByIsDefaultDesc(customerId);
        return shippingAddressMapper.toDtoList(addresses);
    }

    @Override
    @Transactional(readOnly = true)
    public ShippingAddressDto getDefaultAddress(Integer customerId) {
        ShippingAddress defaultAddress = shippingAddressRepository
                .findByCustomerIdCustomerAndIsDefaultTrue(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ mặc định"));
        return shippingAddressMapper.toDto(defaultAddress);
    }

    /**
     * Tạo địa chỉ giao hàng mới
     * 
     * Logic xử lý:
     * 1. Kiểm tra customer tồn tại
     * 2. Map DTO sang entity
     * 3. Xử lý isDefault:
     *    - Nếu set làm default → Unset tất cả địa chỉ default khác
     *    - Đảm bảo chỉ có một địa chỉ mặc định tại một thời điểm
     * 4. Lưu địa chỉ mới
     */
    @Override
    public ShippingAddressDto createAddress(Integer customerId, CreateShippingAddressRequestDto request) {
        // Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        // Map DTO sang entity
        ShippingAddress address = shippingAddressMapper.toEntity(request);
        address.setCustomer(customer);

        // Xử lý isDefault: Nếu set làm default, cần unset các địa chỉ default khác
        // Đảm bảo chỉ có một địa chỉ mặc định tại một thời điểm
        if (Boolean.TRUE.equals(request.getIsDefault())) {
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
        return shippingAddressMapper.toDto(savedAddress);
    }

    @Override
    public ShippingAddressDto updateAddress(Integer customerId, Integer addressId, UpdateShippingAddressRequestDto request) {
        ShippingAddress address = shippingAddressRepository
                .findByIdShippingAddressAndCustomerIdCustomer(addressId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        shippingAddressMapper.updateEntityFromDto(request, address);
        ShippingAddress updatedAddress = shippingAddressRepository.save(address);
        return shippingAddressMapper.toDto(updatedAddress);
    }

    /**
     * Đặt địa chỉ làm mặc định
     * 
     * Logic xử lý:
     * 1. Kiểm tra địa chỉ tồn tại và thuộc về customer
     * 2. Unset tất cả địa chỉ mặc định khác
     * 3. Set địa chỉ này làm mặc định
     * 
     * Đảm bảo: Chỉ có một địa chỉ mặc định tại một thời điểm
     */
    @Override
    public ShippingAddressDto setDefaultAddress(Integer customerId, Integer addressId) {
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
        return shippingAddressMapper.toDto(savedAddress);
    }

    /**
     * Xóa địa chỉ giao hàng
     * 
     * Logic xử lý:
     * 1. Kiểm tra địa chỉ tồn tại và thuộc về customer
     * 2. Kiểm tra địa chỉ mặc định:
     *    - Nếu là địa chỉ mặc định duy nhất → Không cho phép xóa
     *    - Nếu có nhiều địa chỉ mặc định → Cho phép xóa
     * 3. Xóa địa chỉ
     * 
     * Bảo vệ: Không cho xóa địa chỉ mặc định duy nhất để đảm bảo luôn có địa chỉ mặc định
     */
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

