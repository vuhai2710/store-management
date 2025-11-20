package com.storemanagement.service;

import com.storemanagement.dto.employee.EmployeeDTO;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeDTO createEmployee(EmployeeDTO request);
    List<EmployeeDTO> getAllEmployees();
    PageResponse<EmployeeDTO> getAllEmployeesPaginated(Pageable pageable);
    EmployeeDTO getEmployeeById(Integer id);
    EmployeeDTO getEmployeeByUserId(Integer userId);
    EmployeeDTO updateEmployeeByAdmin(Integer id, EmployeeDTO request);
    void deleteEmployee(Integer id);

    EmployeeDTO getMyProfile(String username);
    EmployeeDTO updateMyProfile(String username, EmployeeDTO request);
}