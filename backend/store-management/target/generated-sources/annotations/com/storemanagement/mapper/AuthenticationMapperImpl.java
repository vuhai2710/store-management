package com.storemanagement.mapper;

import com.storemanagement.dto.response.UserDto;
import com.storemanagement.model.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class AuthenticationMapperImpl implements AuthenticationMapper {

    @Override
    public UserDto toUserDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        userDto.createdAt( entity.getCreatedAt() );
        userDto.email( entity.getEmail() );
        userDto.idUser( entity.getIdUser() );
        userDto.isActive( entity.getIsActive() );
        userDto.role( entity.getRole() );
        userDto.updatedAt( entity.getUpdatedAt() );
        userDto.username( entity.getUsername() );

        return userDto.build();
    }
}
