package com.storemanagement.mapper;

import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AuthenticationMapper {

    UserDTO toUserDTO(User entity);
}
