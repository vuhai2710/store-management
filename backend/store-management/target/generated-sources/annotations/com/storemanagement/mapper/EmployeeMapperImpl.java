package com.storemanagement.mapper;

import com.storemanagement.dto.employee.EmployeeDTO;
import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class EmployeeMapperImpl implements EmployeeMapper {

    @Override
    public EmployeeDTO toDTO(Employee entity) {
        if ( entity == null ) {
            return null;
        }

        EmployeeDTO.EmployeeDTOBuilder<?, ?> employeeDTO = EmployeeDTO.builder();

        employeeDTO.idEmployee( entity.getIdEmployee() );
        employeeDTO.idUser( entityUserIdUser( entity ) );
        employeeDTO.username( entityUserUsername( entity ) );
        employeeDTO.email( entityUserEmail( entity ) );
        employeeDTO.isActive( entityUserIsActive( entity ) );
        employeeDTO.createdAt( entity.getCreatedAt() );
        employeeDTO.updatedAt( entity.getUpdatedAt() );
        employeeDTO.employeeName( entity.getEmployeeName() );
        employeeDTO.hireDate( entity.getHireDate() );
        employeeDTO.phoneNumber( entity.getPhoneNumber() );
        employeeDTO.address( entity.getAddress() );
        employeeDTO.baseSalary( entity.getBaseSalary() );

        return employeeDTO.build();
    }

    @Override
    public List<EmployeeDTO> toDTOList(List<Employee> entities) {
        if ( entities == null ) {
            return null;
        }

        List<EmployeeDTO> list = new ArrayList<EmployeeDTO>( entities.size() );
        for ( Employee employee : entities ) {
            list.add( toDTO( employee ) );
        }

        return list;
    }

    @Override
    public Employee toEntity(EmployeeDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Employee.EmployeeBuilder employee = Employee.builder();

        employee.employeeName( dto.getEmployeeName() );
        employee.hireDate( dto.getHireDate() );
        employee.phoneNumber( dto.getPhoneNumber() );
        employee.address( dto.getAddress() );
        employee.baseSalary( dto.getBaseSalary() );

        return employee.build();
    }

    @Override
    public void updateEntityFromDto(EmployeeDTO dto, Employee entity) {
        if ( dto == null ) {
            return;
        }

        entity.setCreatedAt( dto.getCreatedAt() );
        entity.setUpdatedAt( dto.getUpdatedAt() );
        entity.setEmployeeName( dto.getEmployeeName() );
        entity.setHireDate( dto.getHireDate() );
        entity.setPhoneNumber( dto.getPhoneNumber() );
        entity.setAddress( dto.getAddress() );
        entity.setBaseSalary( dto.getBaseSalary() );
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
