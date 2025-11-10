package com.storemanagement.mapper;

import com.storemanagement.dto.response.EmployeeDto;
import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:03+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class EmployeeMapperImpl implements EmployeeMapper {

    @Override
    public EmployeeDto toDto(Employee entity) {
        if ( entity == null ) {
            return null;
        }

        EmployeeDto.EmployeeDtoBuilder employeeDto = EmployeeDto.builder();

        employeeDto.idUser( entityUserIdUser( entity ) );
        employeeDto.username( entityUserUsername( entity ) );
        employeeDto.email( entityUserEmail( entity ) );
        employeeDto.isActive( entityUserIsActive( entity ) );
        employeeDto.address( entity.getAddress() );
        employeeDto.baseSalary( entity.getBaseSalary() );
        employeeDto.createdAt( entity.getCreatedAt() );
        employeeDto.employeeName( entity.getEmployeeName() );
        employeeDto.hireDate( entity.getHireDate() );
        employeeDto.idEmployee( entity.getIdEmployee() );
        employeeDto.phoneNumber( entity.getPhoneNumber() );
        employeeDto.updatedAt( entity.getUpdatedAt() );

        return employeeDto.build();
    }

    @Override
    public List<EmployeeDto> toDtoList(List<Employee> entities) {
        if ( entities == null ) {
            return null;
        }

        List<EmployeeDto> list = new ArrayList<EmployeeDto>( entities.size() );
        for ( Employee employee : entities ) {
            list.add( toDto( employee ) );
        }

        return list;
    }

    @Override
    public Employee toEntity(EmployeeDto dto) {
        if ( dto == null ) {
            return null;
        }

        Employee.EmployeeBuilder employee = Employee.builder();

        employee.address( dto.getAddress() );
        employee.baseSalary( dto.getBaseSalary() );
        employee.employeeName( dto.getEmployeeName() );
        employee.hireDate( dto.getHireDate() );
        employee.phoneNumber( dto.getPhoneNumber() );

        return employee.build();
    }

    @Override
    public void updateEntityFromDto(EmployeeDto dto, Employee entity) {
        if ( dto == null ) {
            return;
        }

        entity.setAddress( dto.getAddress() );
        entity.setBaseSalary( dto.getBaseSalary() );
        entity.setEmployeeName( dto.getEmployeeName() );
        entity.setHireDate( dto.getHireDate() );
        entity.setPhoneNumber( dto.getPhoneNumber() );
    }

    private Integer entityUserIdUser(Employee employee) {
        User user = employee.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getIdUser();
    }

    private String entityUserUsername(Employee employee) {
        User user = employee.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUsername();
    }

    private String entityUserEmail(Employee employee) {
        User user = employee.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getEmail();
    }

    private Boolean entityUserIsActive(Employee employee) {
        User user = employee.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getIsActive();
    }
}
