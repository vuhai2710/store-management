package com.storemanagement.mapper;

import com.storemanagement.dto.promotion.PromotionRuleDTO;
import com.storemanagement.model.PromotionRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PromotionRuleMapper {
    @Mapping(target = "idRule", source = "idRule")
    PromotionRuleDTO toDTO(PromotionRule rule);

    @Mapping(target = "idRule", ignore = true)
    PromotionRule toEntity(PromotionRuleDTO dto);

    List<PromotionRuleDTO> toDTOList(List<PromotionRule> rules);
}

