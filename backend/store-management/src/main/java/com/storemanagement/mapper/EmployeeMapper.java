package com.storemanagement.mapper;

import com.storemanagement.dto.employee.EmployeeDTO;
import com.storemanagement.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    // Employee → EmployeeDTO
    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(source = "user.idUser", target = "idUser")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.isActive", target = "isActive")
    @Mapping(target = "password", ignore = true)
    EmployeeDTO toDTO(Employee entity);

    List<EmployeeDTO> toDTOList(List<Employee> entities);

    // EmployeeDTO → Employee (for create/update)
    @Mapping(target = "idEmployee", ignore = true)
    @Mapping(target = "user", ignore = true)
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    // password, username, email are in EmployeeDTO but handled via User entity in service
    Employee toEntity(EmployeeDTO dto);

    // Update Employee từ EmployeeDTO
    @Mapping(target = "idEmployee", ignore = true)
    @Mapping(target = "user", ignore = true)
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    // password, username, email are in EmployeeDTO but handled via User entity in service
    void updateEntityFromDto(EmployeeDTO dto, @MappingTarget Employee entity);
}

