package com.storemanagement.mapper;

import com.storemanagement.dto.employee.EmployeeDTO;
import com.storemanagement.dto.employee.EmployeeDetailDTO;
import com.storemanagement.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(source = "user.idUser", target = "idUser")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.isActive", target = "isActive")
    @Mapping(target = "password", ignore = true)
    EmployeeDTO toDTO(Employee entity);

    List<EmployeeDTO> toDTOList(List<Employee> entities);

    @Mapping(target = "idEmployee", source = "idEmployee")
    @Mapping(source = "user.idUser", target = "idUser")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.isActive", target = "isActive")
    @Mapping(source = "user.avatarUrl", target = "avatarUrl")
    @Mapping(target = "totalOrdersHandled", ignore = true)
    @Mapping(target = "totalOrderAmount", ignore = true)
    @Mapping(target = "totalReturnOrders", ignore = true)
    @Mapping(target = "totalExchangeOrders", ignore = true)
    @Mapping(target = "pendingOrders", ignore = true)
    @Mapping(target = "completedOrders", ignore = true)
    @Mapping(target = "cancelledOrders", ignore = true)
    EmployeeDetailDTO toDetailDTO(Employee entity);

    @Mapping(target = "idEmployee", ignore = true)
    @Mapping(target = "user", ignore = true)
    Employee toEntity(EmployeeDTO dto);

    @Mapping(target = "idEmployee", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntityFromDto(EmployeeDTO dto, @MappingTarget Employee entity);
}

