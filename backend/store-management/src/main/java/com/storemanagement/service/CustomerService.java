package com.storemanagement.service;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.response.CustomerDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {
    CustomerDto createCustomerForUser(User user, AuthenticationRequestDto request);
    List<CustomerDto> getAllCustomers();
    PageResponse<CustomerDto> getAllCustomersPaginated(Pageable pageable);

    CustomerDto getCustomerById(Integer id);
    CustomerDto getCustomerByUsername(String username);
    List<CustomerDto> searchCustomers(String name, String phone);
    PageResponse<CustomerDto> searchCustomersPaginated(String name, String phone, Pageable pageable);
    List<CustomerDto> getCustomersByType(String type);
    PageResponse<CustomerDto> getCustomersByTypePaginated(String type, Pageable pageable);
    CustomerDto updateCustomer(Integer id, CustomerDto customerDto);
    CustomerDto upgradeToVip(Integer id);
    CustomerDto downgradeToRegular(Integer id);
    void deleteCustomer(Integer id);
    void deleteCustomerByUser(User user);
    CustomerDto updateMyCustomerInfo(String username, CustomerDto customerDto);
    
    // Tạo customer không có user account (cho walk-in customers)
    CustomerDto createCustomerWithoutUser(String customerName, String phoneNumber, String address);
}
