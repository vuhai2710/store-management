package com.storemanagement.mapper;

import com.storemanagement.dto.order.OrderDTO;
import com.storemanagement.dto.order.OrderDetailDTO;
import com.storemanagement.model.Order;
import com.storemanagement.model.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    // Order → OrderDTO
    @Mapping(target = "idOrder", source = "idOrder")
    @Mapping(target = "idCustomer", source = "customer.idCustomer")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "customerAddress", source = "customer.address")
    @Mapping(target = "customerPhone", source = "customer.phoneNumber")
    @Mapping(target = "idEmployee", expression = "java(entity.getEmployee() != null ? entity.getEmployee().getIdEmployee() : null)")
    @Mapping(target = "employeeName", expression = "java(entity.getEmployee() != null ? entity.getEmployee().getEmployeeName() : null)")
    @Mapping(target = "idShippingAddress", expression = "java(entity.getShippingAddress() != null ? entity.getShippingAddress().getIdShippingAddress() : null)")
    @Mapping(target = "shippingAddressSnapshot", source = "shippingAddressSnapshot")
    @Mapping(target = "paymentLinkUrl", ignore = true)
    @Mapping(target = "orderDetails", expression = "java(mapOrderDetails(entity.getOrderDetails()))")
    @Mapping(target = "promotionCode", source = "promotionCode")
    @Mapping(target = "idPromotion", expression = "java(entity.getPromotion() != null ? entity.getPromotion().getIdPromotion() : null)")
    @Mapping(target = "idPromotionRule", expression = "java(entity.getPromotionRule() != null ? entity.getPromotionRule().getIdRule() : null)")
    @Mapping(target = "promotionName", expression = "java(getPromotionName(entity))")
    @Mapping(target = "promotionDiscountType", expression = "java(getPromotionDiscountType(entity))")
    @Mapping(target = "promotionDiscountValue", expression = "java(getPromotionDiscountValue(entity))")
    @Mapping(target = "promotionScope", expression = "java(getPromotionScope(entity))")
    @Mapping(target = "shippingFee", source = "shippingFee")
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "customerNameForCreate", ignore = true)
    @Mapping(target = "customerPhoneForCreate", ignore = true)
    @Mapping(target = "customerAddressForCreate", ignore = true)
    @Mapping(target = "shippingAddressId", ignore = true)
    OrderDTO toDTO(Order entity);

    // OrderDTO → Order
    @Mapping(target = "idOrder", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "shippingAddress", ignore = true)
    @Mapping(target = "orderDetails", ignore = true)
    @Mapping(target = "shipment", ignore = true)
    @Mapping(target = "orderDate", ignore = true)
    @Mapping(target = "finalAmount", ignore = true)
    @Mapping(target = "promotion", ignore = true)
    @Mapping(target = "promotionRule", ignore = true)
    Order toEntity(OrderDTO dto);

    @Mapping(target = "idOrderDetail", source = "idOrderDetail")
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", expression = "java(detail.getProductNameSnapshot() != null ? detail.getProductNameSnapshot() : detail.getProduct().getProductName())")
    @Mapping(target = "productCode", expression = "java(detail.getProductCodeSnapshot() != null ? detail.getProductCodeSnapshot() : detail.getProduct().getProductCode())")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "productNameSnapshot", source = "productNameSnapshot")
    @Mapping(target = "productCodeSnapshot", source = "productCodeSnapshot")
    @Mapping(target = "productImageSnapshot", source = "productImageSnapshot")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "subtotal", expression = "java(detail.getPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))")
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "quantityForCreate", ignore = true)
    OrderDetailDTO detailToDTO(OrderDetail detail);

    default List<OrderDetailDTO> mapOrderDetails(List<OrderDetail> orderDetails) {
        if (orderDetails == null) {
            return List.of();
        }
        return orderDetails.stream()
                .map(this::detailToDTO)
                .toList();
    }

    List<OrderDetailDTO> detailListToDTO(List<OrderDetail> details);

    List<OrderDTO> toDTOList(List<Order> orders);

    // Helper methods for promotion info
    default String getPromotionName(Order entity) {
        if (entity.getPromotion() != null) {
            return entity.getPromotion().getCode();
        }
        if (entity.getPromotionRule() != null) {
            return entity.getPromotionRule().getRuleName();
        }
        return null;
    }

    default String getPromotionDiscountType(Order entity) {
        if (entity.getPromotion() != null) {
            return entity.getPromotion().getDiscountType().name();
        }
        if (entity.getPromotionRule() != null) {
            return entity.getPromotionRule().getDiscountType().name();
        }
        return null;
    }

    default java.math.BigDecimal getPromotionDiscountValue(Order entity) {
        if (entity.getPromotion() != null) {
            return entity.getPromotion().getDiscountValue();
        }
        if (entity.getPromotionRule() != null) {
            return entity.getPromotionRule().getDiscountValue();
        }
        return null;
    }

    default String getPromotionScope(Order entity) {
        if (entity.getPromotion() != null && entity.getPromotion().getScope() != null) {
            return entity.getPromotion().getScope().name();
        }
        if (entity.getPromotionRule() != null && entity.getPromotionRule().getScope() != null) {
            return entity.getPromotionRule().getScope().name();
        }
        return null;
    }
}