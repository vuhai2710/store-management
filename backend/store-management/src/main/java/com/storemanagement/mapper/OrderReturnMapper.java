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
    @Mapping(target = "orderFinalAmount", source = "order.finalAmount")
    @Mapping(target = "orderTotalAmount", source = "order.totalAmount")
    @Mapping(target = "orderDiscount", source = "order.discount")
    @Mapping(target = "orderShippingFee", source = "order.shippingFee")
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
}