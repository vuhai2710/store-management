package com.storemanagement.mapper;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.customer.CustomerDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.utils.CustomerType;
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
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toEntity(RegisterDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.customerName( dto.getCustomerName() );
        customer.address( dto.getAddress() );
        customer.phoneNumber( dto.getPhoneNumber() );

        customer.customerType( CustomerType.REGULAR );

        return customer.build();
    }

    @Override
    public Customer toEntity(CustomerDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.customerName( dto.getCustomerName() );
        customer.address( dto.getAddress() );
        customer.phoneNumber( dto.getPhoneNumber() );
        customer.customerType( dto.getCustomerType() );

        return customer.build();
    }

    @Override
    public CustomerDTO toDTO(Customer entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerDTO.CustomerDTOBuilder<?, ?> customerDTO = CustomerDTO.builder();

        customerDTO.idCustomer( entity.getIdCustomer() );
        customerDTO.idUser( entityUserIdUser( entity ) );
        customerDTO.username( entityUserUsername( entity ) );
        customerDTO.email( entityUserEmail( entity ) );
        customerDTO.isActive( entityUserIsActive( entity ) );
        customerDTO.createdAt( entity.getCreatedAt() );
        customerDTO.updatedAt( entity.getUpdatedAt() );
        customerDTO.customerName( entity.getCustomerName() );
        customerDTO.phoneNumber( entity.getPhoneNumber() );
        customerDTO.address( entity.getAddress() );
        customerDTO.customerType( entity.getCustomerType() );

        return customerDTO.build();
    }

    @Override
    public List<CustomerDTO> toDTOList(List<Customer> entities) {
        if ( entities == null ) {
            return null;
        }

        List<CustomerDTO> list = new ArrayList<CustomerDTO>( entities.size() );
        for ( Customer customer : entities ) {
            list.add( toDTO( customer ) );
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
