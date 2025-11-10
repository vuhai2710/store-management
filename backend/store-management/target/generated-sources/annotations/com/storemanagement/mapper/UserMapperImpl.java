package com.storemanagement.mapper;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.response.UserDto;
import com.storemanagement.model.User;
import com.storemanagement.utils.Role;
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
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(AuthenticationRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.email( dto.getEmail() );
        user.password( dto.getPassword() );
        user.username( dto.getUsername() );

        user.role( Role.CUSTOMER );
        user.isActive( true );

        return user.build();
    }

    @Override
    public UserDto toDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        userDto.idUser( entity.getIdUser() );
        userDto.createdAt( entity.getCreatedAt() );
        userDto.email( entity.getEmail() );
        userDto.isActive( entity.getIsActive() );
        userDto.role( entity.getRole() );
        userDto.updatedAt( entity.getUpdatedAt() );
        userDto.username( entity.getUsername() );

        return userDto.build();
    }

    @Override
    public List<UserDto> toDtoList(List<User> entities) {
        if ( entities == null ) {
            return null;
        }

        List<UserDto> list = new ArrayList<UserDto>( entities.size() );
        for ( User user : entities ) {
            list.add( toDto( user ) );
        }

        return list;
    }
}
