package com.storemanagement.mapper;

import com.storemanagement.dto.response.ShipmentDto;
import com.storemanagement.model.Order;
import com.storemanagement.model.Shipment;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:03+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ShipmentMapperImpl implements ShipmentMapper {

    @Override
    public ShipmentDto toDto(Shipment entity) {
        if ( entity == null ) {
            return null;
        }

        ShipmentDto.ShipmentDtoBuilder shipmentDto = ShipmentDto.builder();

        shipmentDto.idOrder( entityOrderIdOrder( entity ) );
        shipmentDto.ghnExpectedDeliveryTime( entity.getGhnExpectedDeliveryTime() );
        shipmentDto.ghnNote( entity.getGhnNote() );
        shipmentDto.ghnOrderCode( entity.getGhnOrderCode() );
        shipmentDto.ghnShippingFee( entity.getGhnShippingFee() );
        shipmentDto.ghnStatus( entity.getGhnStatus() );
        shipmentDto.ghnUpdatedAt( entity.getGhnUpdatedAt() );
        shipmentDto.idShipment( entity.getIdShipment() );
        shipmentDto.locationLat( entity.getLocationLat() );
        shipmentDto.locationLong( entity.getLocationLong() );
        shipmentDto.shippingMethod( entity.getShippingMethod() );
        shipmentDto.shippingStatus( entity.getShippingStatus() );
        shipmentDto.trackingNumber( entity.getTrackingNumber() );

        return shipmentDto.build();
    }

    @Override
    public List<ShipmentDto> toDtoList(List<Shipment> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ShipmentDto> list = new ArrayList<ShipmentDto>( entities.size() );
        for ( Shipment shipment : entities ) {
            list.add( toDto( shipment ) );
        }

        return list;
    }

    private Integer entityOrderIdOrder(Shipment shipment) {
        Order order = shipment.getOrder();
        if ( order == null ) {
            return null;
        }
        return order.getIdOrder();
    }
}
