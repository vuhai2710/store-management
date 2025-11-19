package com.storemanagement.mapper;

import com.storemanagement.dto.promotion.PromotionDTO;
import com.storemanagement.model.Promotion;
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
public class PromotionMapperImpl implements PromotionMapper {

    @Override
    public PromotionDTO toDTO(Promotion promotion) {
        if ( promotion == null ) {
            return null;
        }

        PromotionDTO.PromotionDTOBuilder<?, ?> promotionDTO = PromotionDTO.builder();

        promotionDTO.idPromotion( promotion.getIdPromotion() );
        promotionDTO.createdAt( promotion.getCreatedAt() );
        promotionDTO.updatedAt( promotion.getUpdatedAt() );
        promotionDTO.code( promotion.getCode() );
        promotionDTO.discountType( promotion.getDiscountType() );
        promotionDTO.discountValue( promotion.getDiscountValue() );
        promotionDTO.minOrderAmount( promotion.getMinOrderAmount() );
        promotionDTO.usageLimit( promotion.getUsageLimit() );
        promotionDTO.usageCount( promotion.getUsageCount() );
        promotionDTO.startDate( promotion.getStartDate() );
        promotionDTO.endDate( promotion.getEndDate() );
        promotionDTO.isActive( promotion.getIsActive() );

        return promotionDTO.build();
    }

    @Override
    public Promotion toEntity(PromotionDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Promotion.PromotionBuilder promotion = Promotion.builder();

        promotion.code( dto.getCode() );
        promotion.discountType( dto.getDiscountType() );
        promotion.discountValue( dto.getDiscountValue() );
        promotion.minOrderAmount( dto.getMinOrderAmount() );
        promotion.usageLimit( dto.getUsageLimit() );
        promotion.startDate( dto.getStartDate() );
        promotion.endDate( dto.getEndDate() );
        promotion.isActive( dto.getIsActive() );

        return promotion.build();
    }

    @Override
    public List<PromotionDTO> toDTOList(List<Promotion> promotions) {
        if ( promotions == null ) {
            return null;
        }

        List<PromotionDTO> list = new ArrayList<PromotionDTO>( promotions.size() );
        for ( Promotion promotion : promotions ) {
            list.add( toDTO( promotion ) );
        }

        return list;
    }
}
