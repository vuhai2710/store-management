package com.storemanagement.repository;

import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByUser(User user);
    Optional<Employee> findByUser_IdUser(Integer idUser);
    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Search employees by keyword (name, phone, email)
     */
    @Query("SELECT e FROM Employee e WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(e.employeeName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Employee> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}


