package com.storemanagement.service;

import com.storemanagement.dto.CustomerRequest;
import com.storemanagement.dto.CustomerResponse;
import com.storemanagement.entity.Customer;
import com.storemanagement.entity.User;
import com.storemanagement.exception.BadRequestException;
import com.storemanagement.exception.ResourceNotFoundException;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return convertToResponse(customer);
    }
    
    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String keyword) {
        return customerRepository.searchCustomers(keyword).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomersByType(String type) {
        try {
            Customer.CustomerType customerType = Customer.CustomerType.valueOf(type.toUpperCase());
            return customerRepository.findByCustomerType(customerType).stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Loại khách hàng không hợp lệ: " + type);
        }
    }
    
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = new Customer();
        
        if (request.getIdUser() != null) {
            User user = userRepository.findById(request.getIdUser())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getIdUser()));
            
            if (user.getRole() != User.UserRole.CUSTOMER) {
                throw new BadRequestException("User phải có role CUSTOMER");
            }
            
            if (customerRepository.findByUser_IdUser(user.getIdUser()).isPresent()) {
                throw new BadRequestException("User này đã được liên kết với khách hàng khác");
            }
            
            customer.setUser(user);
        }
        
        customer.setCustomerName(request.getCustomerName());
        customer.setAddress(request.getAddress());
        customer.setPhoneNumber(request.getPhoneNumber());
        
        if (request.getCustomerType() != null) {
            try {
                customer.setCustomerType(Customer.CustomerType.valueOf(request.getCustomerType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setCustomerType(Customer.CustomerType.REGULAR);
            }
        } else {
            customer.setCustomerType(Customer.CustomerType.REGULAR);
        }
        
        Customer savedCustomer = customerRepository.save(customer);
        return convertToResponse(savedCustomer);
    }
    
    @Transactional
    public CustomerResponse updateCustomer(Integer id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        
        if (request.getIdUser() != null && !request.getIdUser().equals(customer.getUser() != null ? customer.getUser().getIdUser() : null)) {
            User user = userRepository.findById(request.getIdUser())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getIdUser()));
            
            if (user.getRole() != User.UserRole.CUSTOMER) {
                throw new BadRequestException("User phải có role CUSTOMER");
            }
            
            if (customerRepository.findByUser_IdUser(user.getIdUser()).isPresent()) {
                throw new BadRequestException("User này đã được liên kết với khách hàng khác");
            }
            
            customer.setUser(user);
        }
        
        customer.setCustomerName(request.getCustomerName());
        customer.setAddress(request.getAddress());
        customer.setPhoneNumber(request.getPhoneNumber());
        
        if (request.getCustomerType() != null) {
            try {
                customer.setCustomerType(Customer.CustomerType.valueOf(request.getCustomerType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep current type if invalid
            }
        }
        
        Customer updatedCustomer = customerRepository.save(customer);
        return convertToResponse(updatedCustomer);
    }
    
    @Transactional
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customerRepository.delete(customer);
    }
    
    private CustomerResponse convertToResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setIdCustomer(customer.getIdCustomer());
        response.setCustomerName(customer.getCustomerName());
        response.setAddress(customer.getAddress());
        response.setPhoneNumber(customer.getPhoneNumber());
        response.setCustomerType(customer.getCustomerType().name());
        
        if (customer.getUser() != null) {
            response.setIdUser(customer.getUser().getIdUser());
            response.setUsername(customer.getUser().getUsername());
            response.setEmail(customer.getUser().getEmail());
            response.setIsActive(customer.getUser().getIsActive());
        }
        
        return response;
    }
}
