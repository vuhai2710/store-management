package com.storemanagement.service.impl;

import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.CustomerDto;
import com.storemanagement.mapper.CustomerMapper;
import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.CustomerService;
import com.storemanagement.utility.CustomerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final UserRepository userRepository;

    @Override
    public CustomerDto createCustomerForUser(User user, AuthenticationRequestDto request) {
        Customer customer = customerMapper.toEntity(request);
        customer.setUser(user);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(savedCustomer);
    }

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerMapper.toDtoList(customerRepository.findAll());
    }

    @Override
    public CustomerDto getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        return customerMapper.toDto(customer);
    }

    @Override
    public CustomerDto getCustomerByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với username: " + username));
        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại cho user: " + username));
        return customerMapper.toDto(customer);
    }

    @Override
    public List<CustomerDto> searchCustomers(String name, String phone) {
        List<Customer> customers = customerRepository.findAll();

        if (name != null && !name.isEmpty()) {
            customers = customers.stream()
                    .filter(c -> c.getCustomerName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (phone != null && !phone.isEmpty()) {
            customers = customers.stream()
                    .filter(c -> c.getPhoneNumber().contains(phone))
                    .collect(Collectors.toList());
        }

        return customerMapper.toDtoList(customers);
    }

    @Override
    public List<CustomerDto> getCustomersByType(String type) {
        try {
            CustomerType customerType = CustomerType.valueOf(type.toUpperCase());
            List<Customer> customers = customerRepository.findByCustomerType(customerType);
            return customerMapper.toDtoList(customers);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Customer type không hợp lệ: " + type);
        }
    }

    @Override
    public CustomerDto updateCustomer(Integer id, CustomerDto customerDto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));

        if (customerDto.getCustomerName() != null) {
            customer.setCustomerName(customerDto.getCustomerName());
        }
        if (customerDto.getPhoneNumber() != null) {
            customer.setPhoneNumber(customerDto.getPhoneNumber());
        }
        if (customerDto.getAddress() != null) {
            customer.setAddress(customerDto.getAddress());
        }
        if (customerDto.getCustomerType() != null) {
            customer.setCustomerType(customerDto.getCustomerType());
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(updatedCustomer);
    }

    @Override
    public CustomerDto upgradeToVip(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        customer.setCustomerType(CustomerType.VIP);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(updatedCustomer);
    }

    @Override
    public CustomerDto downgradeToRegular(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        customer.setCustomerType(CustomerType.REGULAR);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(updatedCustomer);
    }

    @Override
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        customerRepository.delete(customer);
    }

    @Override
    public CustomerDto updateMyCustomerInfo(String username, CustomerDto customerDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với username: " + username));
        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại cho user: " + username));

        // Customer chỉ được cập nhật một số thông tin cơ bản, không được thay đổi customerType
        if (customerDto.getCustomerName() != null) {
            customer.setCustomerName(customerDto.getCustomerName());
        }
        if (customerDto.getPhoneNumber() != null) {
            customer.setPhoneNumber(customerDto.getPhoneNumber());
        }
        if (customerDto.getAddress() != null) {
            customer.setAddress(customerDto.getAddress());
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(updatedCustomer);
    }
}
