package com.storemanagement.mapper;

import com.storemanagement.dto.shipment.ShipmentDTO;
import com.storemanagement.model.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShipmentMapper {

    @Mapping(target = "idShipment", source = "idShipment")
    @Mapping(target = "idOrder", source = "order.idOrder")
    ShipmentDTO toDTO(Shipment entity);

    List<ShipmentDTO> toDTOList(List<Shipment> entities);

    // ShipmentDTO → Shipment
    @Mapping(target = "idShipment", ignore = true)
    @Mapping(target = "order", ignore = true)
    Shipment toEntity(ShipmentDTO dto);
}