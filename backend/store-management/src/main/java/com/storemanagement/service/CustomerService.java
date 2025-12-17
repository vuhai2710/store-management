package com.storemanagement.service;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.customer.CustomerDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {
    CustomerDTO createCustomerForUser(User user, RegisterDTO request);
    List<CustomerDTO> getAllCustomers();
    PageResponse<CustomerDTO> getAllCustomersPaginated(String keyword, Pageable pageable);

    CustomerDTO getCustomerById(Integer id);
    CustomerDTO getCustomerByUsername(String username);
    List<CustomerDTO> searchCustomers(String name, String phone);
    PageResponse<CustomerDTO> searchCustomersPaginated(String name, String phone, Pageable pageable);
    List<CustomerDTO> getCustomersByType(String type);
    PageResponse<CustomerDTO> getCustomersByTypePaginated(String type, Pageable pageable);
    CustomerDTO updateCustomer(Integer id, CustomerDTO customerDTO);
    CustomerDTO upgradeToVip(Integer id);
    CustomerDTO downgradeToRegular(Integer id);
    void deleteCustomer(Integer id);
    void deleteCustomerByUser(User user);
    CustomerDTO updateMyCustomerInfo(String username, CustomerDTO customerDTO);

    CustomerDTO createCustomerWithoutUser(String customerName, String phoneNumber, String address);
}
