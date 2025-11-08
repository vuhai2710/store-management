package com.storemanagement.service;

import com.storemanagement.dto.response.EmployeeDto;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto request);
    List<EmployeeDto> getAllEmployees();
    PageResponse<EmployeeDto> getAllEmployeesPaginated(Pageable pageable);
    EmployeeDto getEmployeeById(Integer id);
    EmployeeDto getEmployeeByUserId(Integer userId);
    EmployeeDto updateEmployeeByAdmin(Integer id, EmployeeDto request);
    void deleteEmployee(Integer id);

    EmployeeDto getMyProfile(String username);
    EmployeeDto updateMyProfile(String username, EmployeeDto request);
}



