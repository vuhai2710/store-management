package com.storemanagement.mapper;

import com.storemanagement.dto.shipment.ShipmentDTO;
import com.storemanagement.model.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper cho Shipment Entity ↔ ShipmentDTO
 * 
 * Sử dụng MapStruct để tự động generate mapping code
 * 
 * Logic mapping:
 * - Map tất cả fields từ Shipment sang ShipmentDTO
 * - Map idOrder từ Shipment.order.idOrder
 */
@Mapper(componentModel = "spring")
public interface ShipmentMapper {
    
    /**
     * Shipment → ShipmentDTO
     * 
     * @param entity Shipment entity
     * @return ShipmentDTO
     */
    @Mapping(target = "idShipment", source = "idShipment")
    @Mapping(target = "idOrder", source = "order.idOrder")
    ShipmentDTO toDTO(Shipment entity);
    
    /**
     * List<Shipment> → List<ShipmentDTO>
     * 
     * @param entities List of Shipment entities
     * @return List of ShipmentDTO
     */
    List<ShipmentDTO> toDTOList(List<Shipment> entities);

    // ShipmentDTO → Shipment (for create/update)
    @Mapping(target = "idShipment", ignore = true)
    @Mapping(target = "order", ignore = true)
    Shipment toEntity(ShipmentDTO dto);
}
















