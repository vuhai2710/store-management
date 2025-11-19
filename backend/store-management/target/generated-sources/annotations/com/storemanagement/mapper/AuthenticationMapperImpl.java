package com.storemanagement.mapper;

import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class AuthenticationMapperImpl implements AuthenticationMapper {

    @Override
    public UserDTO toUserDTO(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDTO.UserDTOBuilder<?, ?> userDTO = UserDTO.builder();

        userDTO.createdAt( entity.getCreatedAt() );
        userDTO.updatedAt( entity.getUpdatedAt() );
        userDTO.idUser( entity.getIdUser() );
        userDTO.username( entity.getUsername() );
        userDTO.email( entity.getEmail() );
        userDTO.password( entity.getPassword() );
        userDTO.role( entity.getRole() );
        userDTO.isActive( entity.getIsActive() );
        userDTO.avatarUrl( entity.getAvatarUrl() );

        return userDTO.build();
    }
}
