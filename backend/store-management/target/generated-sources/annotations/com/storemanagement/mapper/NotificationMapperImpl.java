package com.storemanagement.mapper;

import com.storemanagement.dto.notification.NotificationDTO;
import com.storemanagement.model.Notification;
import com.storemanagement.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:01+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationDTO toDTO(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationDTO.NotificationDTOBuilder notificationDTO = NotificationDTO.builder();

        notificationDTO.idNotification( notification.getIdNotification() );
        notificationDTO.idUser( notificationUserIdUser( notification ) );
        notificationDTO.username( notificationUserUsername( notification ) );
        notificationDTO.createdAt( notification.getCreatedAt() );
        notificationDTO.notificationType( notification.getNotificationType() );
        notificationDTO.title( notification.getTitle() );
        notificationDTO.message( notification.getMessage() );
        notificationDTO.referenceType( notification.getReferenceType() );
        notificationDTO.referenceId( notification.getReferenceId() );
        notificationDTO.isRead( notification.getIsRead() );
        notificationDTO.sentEmail( notification.getSentEmail() );

        return notificationDTO.build();
    }

    @Override
    public List<NotificationDTO> toDTOList(List<Notification> notifications) {
        if ( notifications == null ) {
            return null;
        }

        List<NotificationDTO> list = new ArrayList<NotificationDTO>( notifications.size() );
        for ( Notification notification : notifications ) {
            list.add( toDTO( notification ) );
        }

        return list;
    }

    @Override
    public Notification toEntity(NotificationDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        notification.notificationType( dto.getNotificationType() );
        notification.title( dto.getTitle() );
        notification.message( dto.getMessage() );
        notification.referenceType( dto.getReferenceType() );
        notification.referenceId( dto.getReferenceId() );
        notification.isRead( dto.getIsRead() );
        notification.sentEmail( dto.getSentEmail() );

        return notification.build();
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
