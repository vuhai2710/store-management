package com.storemanagement.mapper;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.response.UserDto;
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

    // AuthenticationDto → User
    @Mapping(target = "role", constant = "CUSTOMER")
    @Mapping(target = "isActive", constant = "true")
    User toEntity(AuthenticationRequestDto dto);

    // User → UserDto
    UserDto toDto(User entity);

    List<UserDto> toDtoList(List<User> entities);
}
