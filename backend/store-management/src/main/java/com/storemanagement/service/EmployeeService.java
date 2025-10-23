package com.storemanagement.service;

import com.storemanagement.dto.EmployeeRequest;
import com.storemanagement.dto.EmployeeResponse;
import com.storemanagement.entity.Employee;
import com.storemanagement.entity.User;
import com.storemanagement.exception.BadRequestException;
import com.storemanagement.exception.ResourceNotFoundException;
import com.storemanagement.repository.EmployeeRepository;
import com.storemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return convertToResponse(employee);
    }
    
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        Employee employee = new Employee();
        
        if (request.getIdUser() != null) {
            User user = userRepository.findById(request.getIdUser())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getIdUser()));
            
            if (user.getRole() != User.UserRole.EMPLOYEE && user.getRole() != User.UserRole.ADMIN) {
                throw new BadRequestException("User phải có role EMPLOYEE hoặc ADMIN");
            }
            
            if (employeeRepository.findByUser_IdUser(user.getIdUser()).isPresent()) {
                throw new BadRequestException("User này đã được liên kết với nhân viên khác");
            }
            
            employee.setUser(user);
        }
        
        employee.setEmployeeName(request.getEmployeeName());
        employee.setHireDate(request.getHireDate());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setAddress(request.getAddress());
        employee.setBaseSalary(request.getBaseSalary());
        
        Employee savedEmployee = employeeRepository.save(employee);
        return convertToResponse(savedEmployee);
    }
    
    @Transactional
    public EmployeeResponse updateEmployee(Integer id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        if (request.getIdUser() != null && !request.getIdUser().equals(employee.getUser() != null ? employee.getUser().getIdUser() : null)) {
            User user = userRepository.findById(request.getIdUser())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getIdUser()));
            
            if (user.getRole() != User.UserRole.EMPLOYEE && user.getRole() != User.UserRole.ADMIN) {
                throw new BadRequestException("User phải có role EMPLOYEE hoặc ADMIN");
            }
            
            if (employeeRepository.findByUser_IdUser(user.getIdUser()).isPresent()) {
                throw new BadRequestException("User này đã được liên kết với nhân viên khác");
            }
            
            employee.setUser(user);
        }
        
        employee.setEmployeeName(request.getEmployeeName());
        employee.setHireDate(request.getHireDate());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setAddress(request.getAddress());
        employee.setBaseSalary(request.getBaseSalary());
        
        Employee updatedEmployee = employeeRepository.save(employee);
        return convertToResponse(updatedEmployee);
    }
    
    @Transactional
    public void deleteEmployee(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(employee);
    }
    
    private EmployeeResponse convertToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setIdEmployee(employee.getIdEmployee());
        response.setEmployeeName(employee.getEmployeeName());
        response.setHireDate(employee.getHireDate());
        response.setPhoneNumber(employee.getPhoneNumber());
        response.setAddress(employee.getAddress());
        response.setBaseSalary(employee.getBaseSalary());
        
        if (employee.getUser() != null) {
            response.setIdUser(employee.getUser().getIdUser());
            response.setUsername(employee.getUser().getUsername());
            response.setEmail(employee.getUser().getEmail());
            response.setIsActive(employee.getUser().getIsActive());
        }
        
        return response;
    }
}
