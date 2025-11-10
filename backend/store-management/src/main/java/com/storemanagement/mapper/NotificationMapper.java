package com.storemanagement.mapper;

import com.storemanagement.dto.response.NotificationDto;
import com.storemanagement.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    
    @Mapping(source = "user.idUser", target = "idUser")
    @Mapping(source = "user.username", target = "username")
    NotificationDto toDto(Notification notification);
    
    List<NotificationDto> toDtoList(List<Notification> notifications);
}









