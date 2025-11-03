package com.storemanagement.mapper;

import com.storemanagement.dto.EmployeeDto;
import com.storemanagement.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    // Employee → EmployeeDto
    @Mapping(source = "user.idUser", target = "idUser")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.isActive", target = "isActive")
    @Mapping(target = "password", ignore = true)
    // createdAt và updatedAt được map tự động từ BaseEntity của Employee
    EmployeeDto toDto(Employee entity);

    List<EmployeeDto> toDtoList(List<Employee> entities);

    // EmployeeDto → Employee
    @Mapping(target = "idEmployee", ignore = true)
    @Mapping(target = "user", ignore = true)
    Employee toEntity(EmployeeDto dto);

    // Update Employee từ EmployeeDto
    @Mapping(target = "idEmployee", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(EmployeeDto dto, @MappingTarget Employee entity);
}

