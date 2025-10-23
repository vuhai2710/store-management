package com.storemanagement.repository;

import com.storemanagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    
    Optional<Employee> findByUser_IdUser(Integer idUser);
    
    Optional<Employee> findByEmployeeName(String employeeName);
}
