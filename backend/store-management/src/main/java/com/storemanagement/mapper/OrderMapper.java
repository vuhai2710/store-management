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
    // Request-specific fields (ignored when mapping from Entity)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "customerNameForCreate", ignore = true)
    @Mapping(target = "customerPhoneForCreate", ignore = true)
    @Mapping(target = "customerAddressForCreate", ignore = true)
    @Mapping(target = "shippingAddressId", ignore = true)
    OrderDTO toDTO(Order entity);

    // OrderDTO → Order (for create/update - service will handle complex logic)
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
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    Order toEntity(OrderDTO dto);

    /**
     * OrderDetail → OrderDetailDTO
     *
     * SNAPSHOT PROTECTION LOGIC:
     * - Ưu tiên sử dụng snapshot fields (productNameSnapshot, productCodeSnapshot, productImageSnapshot)
     * - Nếu không có snapshot (đơn hàng cũ) → Fallback về product hiện tại
     * - Đảm bảo khi admin chỉnh sửa sản phẩm, đơn hàng đã đặt vẫn hiển thị đúng thông tin tại thời điểm mua
     */
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
    // Request-specific fields (ignored when mapping from Entity)
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
}




