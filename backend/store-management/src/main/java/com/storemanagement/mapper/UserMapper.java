package com.storemanagement.mapper;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * UserMapper - MapStruct mapper cho User entity
 *
 * Note: Date formatting được xử lý tự động bởi JacksonConfig (global config)
 * Không cần custom formatDate method nữa
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    // RegisterDTO → User (for registration)
    @Mapping(target = "idUser", ignore = true)
    @Mapping(target = "role", constant = "CUSTOMER")
    @Mapping(target = "isActive", constant = "true")
    User toEntity(RegisterDTO dto);

    // UserDTO → User (for create/update)
    @Mapping(target = "idUser", ignore = true)
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    // password may be null on update (handled in service)
    User toEntity(UserDTO dto);

    // User → UserDTO
    @Mapping(target = "idUser", source = "idUser")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    UserDTO toDTO(User entity);

    List<UserDTO> toDTOList(List<User> entities);
}
