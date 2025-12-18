package com.storemanagement.service.impl;

import com.storemanagement.dto.employee.EmployeeDTO;
import com.storemanagement.dto.employee.EmployeeDetailDTO;
import com.storemanagement.dto.employee.EmployeeOrderDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.EmployeeMapper;
import com.storemanagement.model.Employee;
import com.storemanagement.model.Order;
import com.storemanagement.model.User;
import com.storemanagement.repository.EmployeeRepository;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.OrderReturnRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.EmployeeService;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderReturnRepository orderReturnRepository;
    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO request) {

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email không được để trống");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        if (employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại: " + request.getPhoneNumber());
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        Employee employee = employeeMapper.toEntity(request);
        employee.setUser(savedUser);
        Employee savedEmployee = employeeRepository.save(employee);

        return employeeMapper.toDTO(savedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employeeMapper.toDTOList(employees);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeDTO> getAllEmployeesPaginated(String keyword, Pageable pageable) {
        Page<Employee> employeePage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            employeePage = employeeRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            employeePage = employeeRepository.findAll(pageable);
        }

        List<EmployeeDTO> employeeDTOs = employeeMapper.toDTOList(employeePage.getContent());
        return PageUtils.toPageResponse(employeePage, employeeDTOs);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + id));
        return employeeMapper.toDTO(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDetailDTO getEmployeeDetailById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + id));

        EmployeeDetailDTO detailDTO = employeeMapper.toDetailDTO(employee);

        Long totalOrders = orderRepository.countOrdersByEmployeeId(id);
        BigDecimal totalAmount = orderRepository.sumOrderAmountByEmployeeId(id);
        Long pendingOrders = orderRepository.countOrdersByEmployeeIdAndStatus(id, Order.OrderStatus.PENDING);
        Long completedOrders = orderRepository.countOrdersByEmployeeIdAndStatus(id, Order.OrderStatus.COMPLETED);
        Long cancelledOrders = orderRepository.countOrdersByEmployeeIdAndStatus(id, Order.OrderStatus.CANCELED);

        Long totalReturnOrders = orderReturnRepository.countReturnOrdersByEmployeeId(id);
        Long totalExchangeOrders = orderReturnRepository.countExchangeOrdersByEmployeeId(id);

        detailDTO.setTotalOrdersHandled(totalOrders != null ? totalOrders : 0L);
        detailDTO.setTotalOrderAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
        detailDTO.setPendingOrders(pendingOrders != null ? pendingOrders : 0L);
        detailDTO.setCompletedOrders(completedOrders != null ? completedOrders : 0L);
        detailDTO.setCancelledOrders(cancelledOrders != null ? cancelledOrders : 0L);
        detailDTO.setTotalReturnOrders(totalReturnOrders != null ? totalReturnOrders : 0L);
        detailDTO.setTotalExchangeOrders(totalExchangeOrders != null ? totalExchangeOrders : 0L);

        return detailDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeByUserId(Integer userId) {
        Employee employee = employeeRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với User ID: " + userId));
        return employeeMapper.toDTO(employee);
    }

    @Override
    public EmployeeDTO updateEmployeeByAdmin(Integer id, EmployeeDTO request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + id));

        User user = employee.getUser();

        if (request.getUsername() != null && !user.getUsername().equals(request.getUsername())) {

            userRepository.findByUsername(request.getUsername())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getIdUser().equals(user.getIdUser())) {
                            throw new RuntimeException("Username đã được sử dụng: " + request.getUsername());
                        }
                    });
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null) {
            throw new RuntimeException("Email không được phép cập nhật. Email chỉ được set khi tạo tài khoản.");
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);

        if (request.getPhoneNumber() != null && !employee.getPhoneNumber().equals(request.getPhoneNumber())) {
            if (employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã tồn tại: " + request.getPhoneNumber());
            }
        }

        employeeMapper.updateEntityFromDto(request, employee);
        Employee updatedEmployee = employeeRepository.save(employee);

        return employeeMapper.toDTO(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + id));

        User user = employee.getUser();

        employeeRepository.delete(employee);

        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + username));

        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Thông tin nhân viên không tồn tại"));

        return employeeMapper.toDTO(employee);
    }

    @Override
    public EmployeeDTO updateMyProfile(String username, EmployeeDTO request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + username));

        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Thông tin nhân viên không tồn tại"));

        if (request.getEmail() != null) {
            throw new RuntimeException("Email không được phép cập nhật. Email chỉ được set khi tạo tài khoản.");
        }

        if (request.getPhoneNumber() != null && !employee.getPhoneNumber().equals(request.getPhoneNumber())) {

            if (employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng: " + request.getPhoneNumber());
            }
            employee.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getEmployeeName() != null) {
            employee.setEmployeeName(request.getEmployeeName());
        }
        if (request.getHireDate() != null) {
            employee.setHireDate(request.getHireDate());
        }
        if (request.getAddress() != null) {
            employee.setAddress(request.getAddress());
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDTO(updatedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeOrderDTO> getOrdersByEmployeeId(
            Integer employeeId,
            Order.OrderStatus status,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + employeeId));

        Page<Order> orderPage = orderRepository.findByEmployeeIdWithFilters(
                employeeId, status, dateFrom, dateTo, pageable);

        List<EmployeeOrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(order -> EmployeeOrderDTO.builder()
                        .idOrder(order.getIdOrder())
                        .customerName(order.getCustomer() != null ? order.getCustomer().getCustomerName() : null)
                        .totalAmount(order.getTotalAmount())
                        .discount(order.getDiscount())
                        .finalAmount(order.getFinalAmount())
                        .status(order.getStatus() != null ? order.getStatus().name() : null)
                        .createdAt(order.getOrderDate())
                        .build())
                .collect(Collectors.toList());

        return PageUtils.toPageResponse(orderPage, orderDTOs);
    }
}
