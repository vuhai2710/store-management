package com.storemanagement.service.impl;

import com.storemanagement.dto.EmployeeDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.EmployeeMapper;
import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import com.storemanagement.repository.EmployeeRepository;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public EmployeeDto createEmployee(EmployeeDto request) {
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

        return employeeMapper.toDto(savedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employeeMapper.toDtoList(employees);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeDto> getAllEmployeesPaginated(Pageable pageable) {
        Page<Employee> employeePage = employeeRepository.findAll(pageable);
        List<EmployeeDto> employeeDtos = employeeMapper.toDtoList(employeePage.getContent());
        return PageUtils.toPageResponse(employeePage, employeeDtos);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + id));
        return employeeMapper.toDto(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeByUserId(Integer userId) {
        Employee employee = employeeRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với User ID: " + userId));
        return employeeMapper.toDto(employee);
    }

    @Override
    public EmployeeDto updateEmployeeByAdmin(Integer id, EmployeeDto request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại với ID: " + id));

        User user = employee.getUser();

        if (request.getUsername() != null && !user.getUsername().equals(request.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
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

        return employeeMapper.toDto(updatedEmployee);
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
    public EmployeeDto getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + username));

        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Thông tin nhân viên không tồn tại"));

        return employeeMapper.toDto(employee);
    }

    @Override
    public EmployeeDto updateMyProfile(String username, EmployeeDto request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại: " + username));

        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Thông tin nhân viên không tồn tại"));

        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
            userRepository.save(user);
        }

        if (request.getPhoneNumber() != null && !employee.getPhoneNumber().equals(request.getPhoneNumber())) {
            if (employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã tồn tại: " + request.getPhoneNumber());
            }
        }

        if (request.getEmployeeName() != null) {
            employee.setEmployeeName(request.getEmployeeName());
        }
        if (request.getHireDate() != null) {
            employee.setHireDate(request.getHireDate());
        }
        if (request.getPhoneNumber() != null) {
            employee.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            employee.setAddress(request.getAddress());
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDto(updatedEmployee);
    }
}



