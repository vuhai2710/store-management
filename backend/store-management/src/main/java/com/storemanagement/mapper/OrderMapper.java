package com.storemanagement.mapper;

import com.storemanagement.dto.OrderDetailDto;
import com.storemanagement.dto.OrderDto;
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
    OrderDto toDto(Order entity);

    // OrderDetail → OrderDetailDto
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "subtotal", expression = "java(detail.getPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))")
    OrderDetailDto detailToDto(OrderDetail detail);

    List<OrderDetailDto> detailListToDto(List<OrderDetail> details);
}

