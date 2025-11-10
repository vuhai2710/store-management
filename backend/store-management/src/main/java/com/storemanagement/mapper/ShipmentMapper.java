package com.storemanagement.mapper;

import com.storemanagement.dto.response.ShipmentDto;
import com.storemanagement.model.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper cho Shipment Entity ↔ ShipmentDto
 * 
 * Sử dụng MapStruct để tự động generate mapping code
 * 
 * Logic mapping:
 * - Map tất cả fields từ Shipment sang ShipmentDto
 * - Map idOrder từ Shipment.order.idOrder
 */
@Mapper(componentModel = "spring")
public interface ShipmentMapper {
    
    /**
     * Shipment → ShipmentDto
     * 
     * @param entity Shipment entity
     * @return ShipmentDto
     */
    @Mapping(target = "idOrder", source = "order.idOrder")
    ShipmentDto toDto(Shipment entity);
    
    /**
     * List<Shipment> → List<ShipmentDto>
     * 
     * @param entities List of Shipment entities
     * @return List of ShipmentDto
     */
    List<ShipmentDto> toDtoList(List<Shipment> entities);
}
















