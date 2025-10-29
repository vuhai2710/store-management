package com.storemanagement.service;

import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.CustomerDto;
import com.storemanagement.model.User;

import java.util.List;

public interface CustomerService {
    CustomerDto createCustomerForUser(User user, AuthenticationRequestDto request);
    List<CustomerDto> getAllCustomers();

    CustomerDto getCustomerById(Integer id);
    CustomerDto getCustomerByUsername(String username);
    List<CustomerDto> searchCustomers(String name, String phone);
    List<CustomerDto> getCustomersByType(String type);
    CustomerDto updateCustomer(Integer id, CustomerDto customerDto);
    CustomerDto upgradeToVip(Integer id);
    CustomerDto downgradeToRegular(Integer id);
    void deleteCustomer(Integer id);
    void deleteCustomerByUser(User user);
    CustomerDto updateMyCustomerInfo(String username, CustomerDto customerDto);
}
