package com.storemanagement.service;

import com.storemanagement.dto.employee.EmployeeDTO;
import com.storemanagement.dto.employee.EmployeeDetailDTO;
import com.storemanagement.dto.employee.EmployeeOrderDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.model.Order;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface EmployeeService {
    EmployeeDTO createEmployee(EmployeeDTO request);

    List<EmployeeDTO> getAllEmployees();

    PageResponse<EmployeeDTO> getAllEmployeesPaginated(String keyword, Pageable pageable);

    EmployeeDTO getEmployeeById(Integer id);

    EmployeeDetailDTO getEmployeeDetailById(Integer id);

    EmployeeDTO getEmployeeByUserId(Integer userId);

    EmployeeDTO updateEmployeeByAdmin(Integer id, EmployeeDTO request);

    void deleteEmployee(Integer id);

    EmployeeDTO getMyProfile(String username);

    EmployeeDTO updateMyProfile(String username, EmployeeDTO request);

    PageResponse<EmployeeOrderDTO> getOrdersByEmployeeId(
            Integer employeeId,
            Order.OrderStatus status,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable);
}
