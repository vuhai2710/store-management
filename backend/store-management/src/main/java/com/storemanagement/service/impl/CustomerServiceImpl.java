package com.storemanagement.service.impl;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.response.CustomerDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.CustomerMapper;
import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.repository.CustomerRepository;
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
    public PageResponse<CustomerDto> getAllCustomersPaginated(Pageable pageable) {
        Page<Customer> customerPage = customerRepository.findAll(pageable);
        List<CustomerDto> customerDtos = customerMapper.toDtoList(customerPage.getContent());
        return PageUtils.toPageResponse(customerPage, customerDtos);
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

        // Nếu không có tham số tìm kiếm, trả về tất cả
        if ((name == null || name.isEmpty()) && (phone == null || phone.isEmpty())) {
            return customerMapper.toDtoList(customers);
        }

        // Sử dụng OR logic: tìm theo name HOẶC phone
        customers = customers.stream()
                .filter(c -> {
                    boolean matchName = false;
                    boolean matchPhone = false;

                    // Kiểm tra tên nếu có
                    if (name != null && !name.isEmpty()) {
                        matchName = c.getCustomerName().toLowerCase().contains(name.toLowerCase());
                    }

                    // Kiểm tra số điện thoại nếu có
                    if (phone != null && !phone.isEmpty()) {
                        matchPhone = c.getPhoneNumber().contains(phone);
                    }

                    // Trả về true nếu khớp ít nhất 1 điều kiện
                    if ((name != null && !name.isEmpty()) && (phone != null && !phone.isEmpty())) {
                        return matchName || matchPhone; // Cả 2 tham số có: OR logic
                    } else if (name != null && !name.isEmpty()) {
                        return matchName; // Chỉ có name
                    } else {
                        return matchPhone; // Chỉ có phone
                    }
                })
                .collect(Collectors.toList());

        return customerMapper.toDtoList(customers);
    }

    @Override
    public PageResponse<CustomerDto> searchCustomersPaginated(String name, String phone, Pageable pageable) {
        String normalizedName = (name == null || name.trim().isEmpty()) ? null : name.trim();
        String normalizedPhone = (phone == null || phone.trim().isEmpty()) ? null : phone.trim();

        Page<Customer> page = customerRepository.searchCustomers(normalizedName, normalizedPhone, pageable);
        List<CustomerDto> customerDtos = customerMapper.toDtoList(page.getContent());
        return PageUtils.toPageResponse(page, customerDtos);
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
    public PageResponse<CustomerDto> getCustomersByTypePaginated(String type, Pageable pageable) {
        try {
            CustomerType customerType = CustomerType.valueOf(type.toUpperCase());
            Page<Customer> page = customerRepository.findByCustomerType(customerType, pageable);
            List<CustomerDto> customerDtos = customerMapper.toDtoList(page.getContent());
            return PageUtils.toPageResponse(page, customerDtos);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Customer type không hợp lệ: " + type);
        }
    }

    @Override
    public CustomerDto updateCustomer(Integer id, CustomerDto customerDto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại với ID: " + id));

        // Cập nhật thông tin customer (tên, phone, address, type)
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

        // Lưu lại user để xóa sau
        User user = customer.getUser();

        // Xóa customer trước
        customerRepository.delete(customer);

        // Xóa user liên quan nếu có
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

    /**
     * Tạo customer không có user account (cho walk-in customers)
     * 
     * Walk-in customers là khách hàng mua trực tiếp tại cửa hàng mà không có tài khoản đăng nhập.
     * Customer này sẽ có:
     * - id_user = NULL (không có User account)
     * - Chỉ lưu thông tin cơ bản: tên, số điện thoại, địa chỉ
     * - Vẫn có thể theo dõi lịch sử mua hàng qua Customer record
     * 
     * Logic:
     * 1. Kiểm tra số điện thoại đã tồn tại chưa (phone number là unique)
     * 2. Nếu đã tồn tại → Throw exception (không tạo trùng)
     * 3. Nếu chưa tồn tại → Tạo customer mới với user = null
     * 
     * Lưu ý: Method này được gọi từ OrderService khi tạo đơn cho walk-in customer.
     * Nếu customer đã tồn tại với số điện thoại, OrderService sẽ sử dụng customer hiện tại.
     * 
     * @param customerName Tên khách hàng (required)
     * @param phoneNumber Số điện thoại (required, unique)
     * @param address Địa chỉ (optional)
     * @return CustomerDto của customer vừa tạo
     * @throws RuntimeException nếu số điện thoại đã được sử dụng
     */
    @Override
    public CustomerDto createCustomerWithoutUser(String customerName, String phoneNumber, String address) {
        // Kiểm tra phone number đã tồn tại chưa
        // Phone number là unique trong database, không được trùng
        customerRepository.findByPhoneNumber(phoneNumber)
                .ifPresent(c -> {
                    throw new RuntimeException("Số điện thoại đã được sử dụng");
                });

        // Tạo customer mới không có user account (cho walk-in customers)
        // Customer này sẽ có id_user = NULL, không thể đăng nhập vào hệ thống
        // Nhưng vẫn có thể theo dõi lịch sử mua hàng
        Customer customer = Customer.builder()
                .user(null) // Không có user account - đây là điểm khác biệt với customer thông thường
                .customerName(customerName)
                .phoneNumber(phoneNumber)
                .address(address)
                .customerType(CustomerType.REGULAR) // Mặc định là REGULAR, có thể nâng cấp lên VIP sau
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(savedCustomer);
    }
}
