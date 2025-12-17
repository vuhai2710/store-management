package com.storemanagement.mapper;

import com.storemanagement.dto.order.OrderReturnDTO;
import com.storemanagement.dto.order.OrderReturnItemDTO;
import com.storemanagement.model.OrderReturn;
import com.storemanagement.model.OrderReturnItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderReturnMapper {

    @Mapping(target = "orderId", source = "order.idOrder")
    @Mapping(target = "customerId", expression = "java(entity.getCreatedByCustomer() != null ? entity.getCreatedByCustomer().getIdCustomer() : null)")
    @Mapping(target = "customerName", expression = "java(entity.getCreatedByCustomer() != null ? entity.getCreatedByCustomer().getCustomerName() : null)")
    @Mapping(target = "orderFinalAmount", source = "order.finalAmount")
    @Mapping(target = "orderTotalAmount", source = "order.totalAmount")
    @Mapping(target = "orderDiscount", source = "order.discount")
    @Mapping(target = "orderShippingFee", source = "order.shippingFee")
    @Mapping(target = "orderPromotionCode", source = "order.promotionCode")
    @Mapping(target = "orderPromotionName", expression = "java(getPromotionName(entity))")
    @Mapping(target = "orderPromotionDiscountType", expression = "java(getPromotionDiscountType(entity))")
    @Mapping(target = "orderPromotionDiscountValue", expression = "java(getPromotionDiscountValue(entity))")
    @Mapping(target = "orderPromotionScope", expression = "java(getPromotionScope(entity))")
    @Mapping(target = "createdByCustomerId",
            expression = "java(entity.getCreatedByCustomer() != null ? entity.getCreatedByCustomer().getIdCustomer() : null)")
    @Mapping(target = "processedByEmployeeId",
            expression = "java(entity.getProcessedByEmployee() != null ? entity.getProcessedByEmployee().getIdEmployee() : null)")
    @Mapping(target = "items", expression = "java(mapItems(entity.getItems()))")
    OrderReturnDTO toDTO(OrderReturn entity);

    @Mapping(target = "idOrderDetail", source = "orderDetail.idOrderDetail")
    @Mapping(target = "productName", expression = "java(item.getOrderDetail() != null ? (item.getOrderDetail().getProductNameSnapshot() != null ? item.getOrderDetail().getProductNameSnapshot() : (item.getOrderDetail().getProduct() != null ? item.getOrderDetail().getProduct().getProductName() : null)) : null)")
    @Mapping(target = "price", source = "orderDetail.price")
    @Mapping(target = "exchangeProductId",
            expression = "java(item.getExchangeProduct() != null ? item.getExchangeProduct().getIdProduct() : null)")
    OrderReturnItemDTO toItemDTO(OrderReturnItem item);

    default List<OrderReturnItemDTO> mapItems(List<OrderReturnItem> items) {
        if (items == null) return List.of();
        return items.stream().map(this::toItemDTO).toList();
    }

    List<OrderReturnDTO> toDTOList(List<OrderReturn> list);

    default String getPromotionName(OrderReturn entity) {
        if (entity.getOrder() == null) return null;
        if (entity.getOrder().getPromotion() != null) {
            return entity.getOrder().getPromotion().getCode();
        }
        if (entity.getOrder().getPromotionRule() != null) {
            return entity.getOrder().getPromotionRule().getRuleName();
        }
        return null;
    }

    default String getPromotionDiscountType(OrderReturn entity) {
        if (entity.getOrder() == null) return null;
        if (entity.getOrder().getPromotion() != null) {
            return entity.getOrder().getPromotion().getDiscountType().name();
        }
        if (entity.getOrder().getPromotionRule() != null) {
            return entity.getOrder().getPromotionRule().getDiscountType().name();
        }
        return null;
    }

    default java.math.BigDecimal getPromotionDiscountValue(OrderReturn entity) {
        if (entity.getOrder() == null) return null;
        if (entity.getOrder().getPromotion() != null) {
            return entity.getOrder().getPromotion().getDiscountValue();
        }
        if (entity.getOrder().getPromotionRule() != null) {
            return entity.getOrder().getPromotionRule().getDiscountValue();
        }
        return null;
    }

    default String getPromotionScope(OrderReturn entity) {
        if (entity.getOrder() == null) return null;
        if (entity.getOrder().getPromotion() != null && entity.getOrder().getPromotion().getScope() != null) {
            return entity.getOrder().getPromotion().getScope().name();
        }
        if (entity.getOrder().getPromotionRule() != null && entity.getOrder().getPromotionRule().getScope() != null) {
            return entity.getOrder().getPromotionRule().getScope().name();
        }
        return null;
    }
}
