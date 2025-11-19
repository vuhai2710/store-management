package com.storemanagement.mapper;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.User;
import com.storemanagement.utils.Role;
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
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(RegisterDTO dto) {
        if ( dto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.username( dto.getUsername() );
        user.password( dto.getPassword() );
        user.email( dto.getEmail() );

        user.role( Role.CUSTOMER );
        user.isActive( true );

        return user.build();
    }

    @Override
    public User toEntity(UserDTO dto) {
        if ( dto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.username( dto.getUsername() );
        user.password( dto.getPassword() );
        user.email( dto.getEmail() );
        user.role( dto.getRole() );
        user.isActive( dto.getIsActive() );
        user.avatarUrl( dto.getAvatarUrl() );

        return user.build();
    }

    @Override
    public UserDTO toDTO(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDTO.UserDTOBuilder<?, ?> userDTO = UserDTO.builder();

        userDTO.idUser( entity.getIdUser() );
        userDTO.avatarUrl( entity.getAvatarUrl() );
        userDTO.createdAt( entity.getCreatedAt() );
        userDTO.updatedAt( entity.getUpdatedAt() );
        userDTO.username( entity.getUsername() );
        userDTO.email( entity.getEmail() );
        userDTO.role( entity.getRole() );
        userDTO.isActive( entity.getIsActive() );

        return userDTO.build();
    }

    @Override
    public List<UserDTO> toDTOList(List<User> entities) {
        if ( entities == null ) {
            return null;
        }

        List<UserDTO> list = new ArrayList<UserDTO>( entities.size() );
        for ( User user : entities ) {
            list.add( toDTO( user ) );
        }

        return list;
    }
}
