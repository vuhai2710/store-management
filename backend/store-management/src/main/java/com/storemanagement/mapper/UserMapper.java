package com.storemanagement.mapper;

import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.UserDto;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    // AuthenticationDto → User
    @Mapping(target = "role", constant = "CUSTOMER")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)  // BaseEntity auto
    User toEntity(AuthenticationRequestDto dto);

    // User → UserDto
    UserDto toDto(User entity);

    List<UserDto> toDtoList(List<User> entities);
}
