package com.storemanagement.mapper;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "idUser", ignore = true)
    @Mapping(target = "role", constant = "CUSTOMER")
    @Mapping(target = "isActive", constant = "true")
    User toEntity(RegisterDTO dto);

    @Mapping(target = "idUser", ignore = true)
    User toEntity(UserDTO dto);

    @Mapping(target = "idUser", source = "idUser")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    UserDTO toDTO(User entity);

    List<UserDTO> toDTOList(List<User> entities);
}
