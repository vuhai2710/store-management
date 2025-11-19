package com.storemanagement.mapper;

import com.storemanagement.dto.shipment.ShipmentDTO;
import com.storemanagement.model.Order;
import com.storemanagement.model.Shipment;
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
public class ShipmentMapperImpl implements ShipmentMapper {

    @Override
    public ShipmentDTO toDTO(Shipment entity) {
        if ( entity == null ) {
            return null;
        }

        ShipmentDTO.ShipmentDTOBuilder shipmentDTO = ShipmentDTO.builder();

        shipmentDTO.idShipment( entity.getIdShipment() );
        shipmentDTO.idOrder( entityOrderIdOrder( entity ) );
        shipmentDTO.shippingStatus( entity.getShippingStatus() );
        shipmentDTO.trackingNumber( entity.getTrackingNumber() );
        shipmentDTO.locationLat( entity.getLocationLat() );
        shipmentDTO.locationLong( entity.getLocationLong() );
        shipmentDTO.ghnOrderCode( entity.getGhnOrderCode() );
        shipmentDTO.ghnShippingFee( entity.getGhnShippingFee() );
        shipmentDTO.ghnExpectedDeliveryTime( entity.getGhnExpectedDeliveryTime() );
        shipmentDTO.ghnStatus( entity.getGhnStatus() );
        shipmentDTO.ghnUpdatedAt( entity.getGhnUpdatedAt() );
        shipmentDTO.ghnNote( entity.getGhnNote() );
        shipmentDTO.shippingMethod( entity.getShippingMethod() );

        return shipmentDTO.build();
    }

    @Override
    public List<ShipmentDTO> toDTOList(List<Shipment> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ShipmentDTO> list = new ArrayList<ShipmentDTO>( entities.size() );
        for ( Shipment shipment : entities ) {
            list.add( toDTO( shipment ) );
        }

        return list;
    }

    @Override
    public Shipment toEntity(ShipmentDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Shipment.ShipmentBuilder shipment = Shipment.builder();

        shipment.shippingStatus( dto.getShippingStatus() );
        shipment.trackingNumber( dto.getTrackingNumber() );
        shipment.locationLat( dto.getLocationLat() );
        shipment.locationLong( dto.getLocationLong() );
        shipment.ghnOrderCode( dto.getGhnOrderCode() );
        shipment.ghnShippingFee( dto.getGhnShippingFee() );
        shipment.ghnExpectedDeliveryTime( dto.getGhnExpectedDeliveryTime() );
        shipment.ghnStatus( dto.getGhnStatus() );
        shipment.ghnUpdatedAt( dto.getGhnUpdatedAt() );
        shipment.ghnNote( dto.getGhnNote() );
        shipment.shippingMethod( dto.getShippingMethod() );

        return shipment.build();
    }

    private Integer entityOrderIdOrder(Shipment shipment) {
        Order order = shipment.getOrder();
        if ( order == null ) {
            return null;
        }
        return order.getIdOrder();
    }
}
