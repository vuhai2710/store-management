package com.storemanagement.repository;

import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByUser(User user);
    Optional<Employee> findByUser_IdUser(Integer idUser);
    boolean existsByPhoneNumber(String phoneNumber);
}


















