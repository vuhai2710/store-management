package com.storemanagement.mapper;

import com.storemanagement.dto.notification.NotificationDTO;
import com.storemanagement.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    
    // Notification → NotificationDTO
    @Mapping(target = "idNotification", source = "idNotification")
    @Mapping(source = "user.idUser", target = "idUser")
    @Mapping(source = "user.username", target = "username")
    @Mapping(target = "createdAt", source = "createdAt")
    NotificationDTO toDTO(Notification notification);
    
    List<NotificationDTO> toDTOList(List<Notification> notifications);

    // NotificationDTO → Notification (for create/update)
    @Mapping(target = "idNotification", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // Set in service via @PrePersist
    Notification toEntity(NotificationDTO dto);
}











