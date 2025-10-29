package com.storemanagement.mapper;

import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.UserDto;
import com.storemanagement.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // AuthenticationDto → User
    @Mapping(target = "role", constant = "CUSTOMER")
    @Mapping(target = "isActive", constant = "true")
    User toEntity(AuthenticationRequestDto dto);

    // User → UserDto
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "formatDate")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "formatDate")
    UserDto toDto(User entity);

    List<UserDto> toDtoList(List<User> entities);

    @Named("formatDate")
    default String formatDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_FORMATTER) : null;
    }
}
