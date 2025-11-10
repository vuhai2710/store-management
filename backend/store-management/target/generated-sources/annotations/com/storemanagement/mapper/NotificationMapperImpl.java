package com.storemanagement.mapper;

import com.storemanagement.dto.response.NotificationDto;
import com.storemanagement.model.Notification;
import com.storemanagement.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationDto toDto(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationDto.NotificationDtoBuilder notificationDto = NotificationDto.builder();

        notificationDto.idUser( notificationUserIdUser( notification ) );
        notificationDto.username( notificationUserUsername( notification ) );
        notificationDto.createdAt( notification.getCreatedAt() );
        notificationDto.idNotification( notification.getIdNotification() );
        notificationDto.isRead( notification.getIsRead() );
        notificationDto.message( notification.getMessage() );
        notificationDto.notificationType( notification.getNotificationType() );
        notificationDto.referenceId( notification.getReferenceId() );
        notificationDto.referenceType( notification.getReferenceType() );
        notificationDto.sentEmail( notification.getSentEmail() );
        notificationDto.title( notification.getTitle() );

        return notificationDto.build();
    }

    @Override
    public List<NotificationDto> toDtoList(List<Notification> notifications) {
        if ( notifications == null ) {
            return null;
        }

        List<NotificationDto> list = new ArrayList<NotificationDto>( notifications.size() );
        for ( Notification notification : notifications ) {
            list.add( toDto( notification ) );
        }

        return list;
    }

    private Integer notificationUserIdUser(Notification notification) {
        User user = notification.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getIdUser();
    }

    private String notificationUserUsername(Notification notification) {
        User user = notification.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUsername();
    }
}
