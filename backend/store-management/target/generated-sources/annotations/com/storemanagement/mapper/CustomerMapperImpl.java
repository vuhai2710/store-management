package com.storemanagement.mapper;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.response.CustomerDto;
import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.utils.CustomerType;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toEntity(AuthenticationRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.address( dto.getAddress() );
        customer.customerName( dto.getCustomerName() );
        customer.phoneNumber( dto.getPhoneNumber() );

        customer.customerType( CustomerType.REGULAR );

        return customer.build();
    }

    @Override
    public CustomerDto toDto(Customer entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerDto.CustomerDtoBuilder customerDto = CustomerDto.builder();

        customerDto.idCustomer( entity.getIdCustomer() );
        customerDto.idUser( entityUserIdUser( entity ) );
        customerDto.username( entityUserUsername( entity ) );
        customerDto.email( entityUserEmail( entity ) );
        customerDto.isActive( entityUserIsActive( entity ) );
        customerDto.address( entity.getAddress() );
        customerDto.createdAt( entity.getCreatedAt() );
        customerDto.customerName( entity.getCustomerName() );
        customerDto.customerType( entity.getCustomerType() );
        customerDto.phoneNumber( entity.getPhoneNumber() );
        customerDto.updatedAt( entity.getUpdatedAt() );

        return customerDto.build();
    }

    @Override
    public List<CustomerDto> toDtoList(List<Customer> entities) {
        if ( entities == null ) {
            return null;
        }

        List<CustomerDto> list = new ArrayList<CustomerDto>( entities.size() );
        for ( Customer customer : entities ) {
            list.add( toDto( customer ) );
        }

        return list;
    }

    private Integer entityUserIdUser(Customer customer) {
        User user = customer.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getIdUser();
    }

    private String entityUserUsername(Customer customer) {
        User user = customer.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUsername();
    }

    private String entityUserEmail(Customer customer) {
        User user = customer.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getEmail();
    }

    private Boolean entityUserIsActive(Customer customer) {
        User user = customer.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getIsActive();
    }
}
