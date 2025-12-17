package com.storemanagement.service.impl;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.customer.CustomerDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.CustomerMapper;
import com.storemanagement.model.Customer;
import com.storemanagement.model.ShippingAddress;
import com.storemanagement.model.User;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.ShippingAddressRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.CustomerService;
import com.storemanagement.utils.CustomerType;
import com.storemanagement.utils.PageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final ShippingAddressRepository shippingAddressRepository;

    @Override
    public CustomerDTO createCustomerForUser(User user, RegisterDTO request) {

        if (customerRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        Customer customer = customerMapper.toEntity(request);
        customer.setUser(user);
        Customer savedCustomer = customerRepository.save(customer);

        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            ShippingAddress defaultAddress = ShippingAddress.builder()
                    .customer(savedCustomer)
                    .recipientName(request.getCustomerName())
                    .phoneNumber(request.getPhoneNumber())
                    .address(request.getAddress())
                    .isDefault(true)
                    .build();
            shippingAddressRepository.save(defaultAddress);
        }

        return customerMapper.toDTO(savedCustomer);
    }

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return customerMapper.toDTOList(customerRepository.findAll());
    }

    @Override
    public PageResponse<CustomerDTO> getAllCustomersPaginated(String keyword, Pageable pageable) {
        Page<Customer> customerPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            customerPage = customerRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            customerPage = customerRepository.findAll(pageable);
        }

        List<CustomerDTO> customerDtos = customerMapper.toDTOList(customerPage.getContent());
        return PageUtils.toPageResponse(customerPage, customerDtos);
    }

    @Override
    public CustomerDTO getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        return customerMapper.toDTO(customer);
    }

    @Override
    public CustomerDTO getCustomerByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với username: " + username));
        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại cho user: " + username));
        return customerMapper.toDTO(customer);
    }

    @Override
    public List<CustomerDTO> searchCustomers(String name, String phone) {
        List<Customer> customers = customerRepository.findAll();

        if ((name == null || name.isEmpty()) && (phone == null || phone.isEmpty())) {
            return customerMapper.toDTOList(customers);
        }

        customers = customers.stream()
                .filter(c -> {
                    boolean matchName = false;
                    boolean matchPhone = false;

                    if (name != null && !name.isEmpty()) {
                        matchName = c.getCustomerName().toLowerCase().contains(name.toLowerCase());
                    }

                    if (phone != null && !phone.isEmpty()) {
                        matchPhone = c.getPhoneNumber().contains(phone);
                    }

                    if ((name != null && !name.isEmpty()) && (phone != null && !phone.isEmpty())) {
                        return matchName || matchPhone;
                    } else if (name != null && !name.isEmpty()) {
                        return matchName;
                    } else {
                        return matchPhone;
                    }
                })
                .collect(Collectors.toList());

        return customerMapper.toDTOList(customers);
    }

    @Override
    public PageResponse<CustomerDTO> searchCustomersPaginated(String name, String phone, Pageable pageable) {
        String normalizedName = (name == null || name.trim().isEmpty()) ? null : name.trim();
        String normalizedPhone = (phone == null || phone.trim().isEmpty()) ? null : phone.trim();

        Page<Customer> page = customerRepository.searchCustomers(normalizedName, normalizedPhone, pageable);
        List<CustomerDTO> customerDtos = customerMapper.toDTOList(page.getContent());
        return PageUtils.toPageResponse(page, customerDtos);
    }

    @Override
    public List<CustomerDTO> getCustomersByType(String type) {
        try {
            CustomerType customerType = CustomerType.valueOf(type.toUpperCase());
            List<Customer> customers = customerRepository.findByCustomerType(customerType);
            return customerMapper.toDTOList(customers);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Customer type không hợp lệ: " + type);
        }
    }

    @Override
    public PageResponse<CustomerDTO> getCustomersByTypePaginated(String type, Pageable pageable) {
        try {
            CustomerType customerType = CustomerType.valueOf(type.toUpperCase());
            Page<Customer> page = customerRepository.findByCustomerType(customerType, pageable);
            List<CustomerDTO> customerDtos = customerMapper.toDTOList(page.getContent());
            return PageUtils.toPageResponse(page, customerDtos);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Customer type không hợp lệ: " + type);
        }
    }

    @Override
    public CustomerDTO updateCustomer(Integer id, CustomerDTO customerDto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));

        if (customerDto.getEmail() != null) {
            throw new RuntimeException("Email không được phép cập nhật. Email chỉ được set khi tạo tài khoản.");
        }

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
        return customerMapper.toDTO(updatedCustomer);
    }

    @Override
    public CustomerDTO upgradeToVip(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        customer.setCustomerType(CustomerType.VIP);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDTO(updatedCustomer);
    }

    @Override
    public CustomerDTO downgradeToRegular(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));
        customer.setCustomerType(CustomerType.REGULAR);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDTO(updatedCustomer);
    }

    @Override
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));

        User user = customer.getUser();

        customerRepository.delete(customer);

        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Override
    public void deleteCustomerByUser(User user) {
        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại cho user"));
        customerRepository.delete(customer);
    }

    @Override
    public CustomerDTO updateMyCustomerInfo(String username, CustomerDTO customerDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với username: " + username));
        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại cho user: " + username));

        if (customerDto.getEmail() != null) {
            throw new RuntimeException("Email không được phép cập nhật. Email chỉ được set khi tạo tài khoản.");
        }

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
        return customerMapper.toDTO(updatedCustomer);
    }

    @Override
    public CustomerDTO createCustomerWithoutUser(String customerName, String phoneNumber, String address) {

        customerRepository.findByPhoneNumber(phoneNumber)
                .ifPresent(c -> {
                    throw new RuntimeException("Số điện thoại đã được sử dụng");
                });

        Customer customer = Customer.builder()
                .user(null)
                .customerName(customerName)
                .phoneNumber(phoneNumber)
                .address(address)
                .customerType(CustomerType.REGULAR)
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDTO(savedCustomer);
    }
}
