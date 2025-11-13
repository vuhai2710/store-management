package com.storemanagement.mapper;

import com.storemanagement.dto.promotion.PromotionDTO;
import com.storemanagement.model.Promotion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    @Mapping(target = "idPromotion", source = "idPromotion")
    PromotionDTO toDTO(Promotion promotion);

    @Mapping(target = "idPromotion", ignore = true)
    @Mapping(target = "usageCount", ignore = true)
    Promotion toEntity(PromotionDTO dto);

    List<PromotionDTO> toDTOList(List<Promotion> promotions);
}


