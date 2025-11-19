package com.storemanagement.mapper;

import com.storemanagement.dto.promotion.PromotionRuleDTO;
import com.storemanagement.model.PromotionRule;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class PromotionRuleMapperImpl implements PromotionRuleMapper {

    @Override
    public PromotionRuleDTO toDTO(PromotionRule rule) {
        if ( rule == null ) {
            return null;
        }

        PromotionRuleDTO.PromotionRuleDTOBuilder<?, ?> promotionRuleDTO = PromotionRuleDTO.builder();

        promotionRuleDTO.idRule( rule.getIdRule() );
        promotionRuleDTO.createdAt( rule.getCreatedAt() );
        promotionRuleDTO.updatedAt( rule.getUpdatedAt() );
        promotionRuleDTO.ruleName( rule.getRuleName() );
        promotionRuleDTO.discountType( rule.getDiscountType() );
        promotionRuleDTO.discountValue( rule.getDiscountValue() );
        promotionRuleDTO.minOrderAmount( rule.getMinOrderAmount() );
        promotionRuleDTO.customerType( rule.getCustomerType() );
        promotionRuleDTO.startDate( rule.getStartDate() );
        promotionRuleDTO.endDate( rule.getEndDate() );
        promotionRuleDTO.isActive( rule.getIsActive() );
        promotionRuleDTO.priority( rule.getPriority() );

        return promotionRuleDTO.build();
    }

    @Override
    public PromotionRule toEntity(PromotionRuleDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PromotionRule.PromotionRuleBuilder promotionRule = PromotionRule.builder();

        promotionRule.ruleName( dto.getRuleName() );
        promotionRule.discountType( dto.getDiscountType() );
        promotionRule.discountValue( dto.getDiscountValue() );
        promotionRule.minOrderAmount( dto.getMinOrderAmount() );
        promotionRule.customerType( dto.getCustomerType() );
        promotionRule.startDate( dto.getStartDate() );
        promotionRule.endDate( dto.getEndDate() );
        promotionRule.isActive( dto.getIsActive() );
        promotionRule.priority( dto.getPriority() );

        return promotionRule.build();
    }

    @Override
    public List<PromotionRuleDTO> toDTOList(List<PromotionRule> rules) {
        if ( rules == null ) {
            return null;
        }

        List<PromotionRuleDTO> list = new ArrayList<PromotionRuleDTO>( rules.size() );
        for ( PromotionRule promotionRule : rules ) {
            list.add( toDTO( promotionRule ) );
        }

        return list;
    }
}
