package com.storemanagement.mapper;

import com.storemanagement.dto.UserDto;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AuthenticationMapper {
    // User to UserDTO
    UserDto toUserDto(User entity);
}
