package com.storemanagement.mapper;

import com.storemanagement.dto.response.OrderDetailDto;
import com.storemanagement.dto.response.OrderDto;
import com.storemanagement.model.Order;
import com.storemanagement.model.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    // Order → OrderDto
    @Mapping(target = "idCustomer", source = "customer.idCustomer")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "customerAddress", source = "customer.address")
    @Mapping(target = "customerPhone", source = "customer.phoneNumber")
    @Mapping(target = "idEmployee", source = "employee.idEmployee")
    @Mapping(target = "employeeName", ignore = true) // Sẽ set trong service
    @Mapping(target = "idShippingAddress", expression = "java(entity.getShippingAddress() != null ? entity.getShippingAddress().getIdShippingAddress() : null)")
    @Mapping(target = "shippingAddressSnapshot", source = "shippingAddressSnapshot")
    OrderDto toDto(Order entity);

    /**
     * OrderDetail → OrderDetailDto
     * 
     * SNAPSHOT PROTECTION LOGIC:
     * - Ưu tiên sử dụng snapshot fields (productNameSnapshot, productCodeSnapshot, productImageSnapshot)
     * - Nếu không có snapshot (đơn hàng cũ) → Fallback về product hiện tại
     * - Đảm bảo khi admin chỉnh sửa sản phẩm, đơn hàng đã đặt vẫn hiển thị đúng thông tin tại thời điểm mua
     */
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", expression = "java(detail.getProductNameSnapshot() != null ? detail.getProductNameSnapshot() : detail.getProduct().getProductName())")
    @Mapping(target = "productCode", expression = "java(detail.getProductCodeSnapshot() != null ? detail.getProductCodeSnapshot() : detail.getProduct().getProductCode())")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "productNameSnapshot", source = "productNameSnapshot")
    @Mapping(target = "productCodeSnapshot", source = "productCodeSnapshot")
    @Mapping(target = "productImageSnapshot", source = "productImageSnapshot")
    @Mapping(target = "subtotal", expression = "java(detail.getPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))")
    OrderDetailDto detailToDto(OrderDetail detail);

    List<OrderDetailDto> detailListToDto(List<OrderDetail> details);
    
    List<OrderDto> toDtoList(List<Order> orders);
}




