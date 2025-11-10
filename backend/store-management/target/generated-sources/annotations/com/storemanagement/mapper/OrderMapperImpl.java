package com.storemanagement.mapper;

import com.storemanagement.dto.response.OrderDetailDto;
import com.storemanagement.dto.response.OrderDto;
import com.storemanagement.model.Customer;
import com.storemanagement.model.Employee;
import com.storemanagement.model.Order;
import com.storemanagement.model.OrderDetail;
import com.storemanagement.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:03+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderDto toDto(Order entity) {
        if ( entity == null ) {
            return null;
        }

        OrderDto.OrderDtoBuilder orderDto = OrderDto.builder();

        orderDto.idCustomer( entityCustomerIdCustomer( entity ) );
        orderDto.customerName( entityCustomerCustomerName( entity ) );
        orderDto.customerAddress( entityCustomerAddress( entity ) );
        orderDto.customerPhone( entityCustomerPhoneNumber( entity ) );
        orderDto.idEmployee( entityEmployeeIdEmployee( entity ) );
        orderDto.employeeName( entityEmployeeEmployeeName( entity ) );
        orderDto.shippingAddressSnapshot( entity.getShippingAddressSnapshot() );
        orderDto.deliveredAt( entity.getDeliveredAt() );
        orderDto.discount( entity.getDiscount() );
        orderDto.finalAmount( entity.getFinalAmount() );
        orderDto.idOrder( entity.getIdOrder() );
        orderDto.notes( entity.getNotes() );
        orderDto.orderDate( entity.getOrderDate() );
        orderDto.orderDetails( detailListToDto( entity.getOrderDetails() ) );
        orderDto.paymentLinkId( entity.getPaymentLinkId() );
        orderDto.paymentMethod( entity.getPaymentMethod() );
        orderDto.status( entity.getStatus() );
        orderDto.totalAmount( entity.getTotalAmount() );

        orderDto.idShippingAddress( entity.getShippingAddress() != null ? entity.getShippingAddress().getIdShippingAddress() : null );

        return orderDto.build();
    }

    @Override
    public OrderDetailDto detailToDto(OrderDetail detail) {
        if ( detail == null ) {
            return null;
        }

        OrderDetailDto.OrderDetailDtoBuilder orderDetailDto = OrderDetailDto.builder();

        orderDetailDto.idProduct( detailProductIdProduct( detail ) );
        orderDetailDto.sku( detailProductSku( detail ) );
        orderDetailDto.productNameSnapshot( detail.getProductNameSnapshot() );
        orderDetailDto.productCodeSnapshot( detail.getProductCodeSnapshot() );
        orderDetailDto.productImageSnapshot( detail.getProductImageSnapshot() );
        orderDetailDto.idOrderDetail( detail.getIdOrderDetail() );
        orderDetailDto.price( detail.getPrice() );
        orderDetailDto.quantity( detail.getQuantity() );

        orderDetailDto.productName( detail.getProductNameSnapshot() != null ? detail.getProductNameSnapshot() : detail.getProduct().getProductName() );
        orderDetailDto.productCode( detail.getProductCodeSnapshot() != null ? detail.getProductCodeSnapshot() : detail.getProduct().getProductCode() );
        orderDetailDto.subtotal( detail.getPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())) );

        return orderDetailDto.build();
    }

    @Override
    public List<OrderDetailDto> detailListToDto(List<OrderDetail> details) {
        if ( details == null ) {
            return null;
        }

        List<OrderDetailDto> list = new ArrayList<OrderDetailDto>( details.size() );
        for ( OrderDetail orderDetail : details ) {
            list.add( detailToDto( orderDetail ) );
        }

        return list;
    }

    @Override
    public List<OrderDto> toDtoList(List<Order> orders) {
        if ( orders == null ) {
            return null;
        }

        List<OrderDto> list = new ArrayList<OrderDto>( orders.size() );
        for ( Order order : orders ) {
            list.add( toDto( order ) );
        }

        return list;
    }

    private Integer entityCustomerIdCustomer(Order order) {
        Customer customer = order.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getIdCustomer();
    }

    private String entityCustomerCustomerName(Order order) {
        Customer customer = order.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getCustomerName();
    }

    private String entityCustomerAddress(Order order) {
        Customer customer = order.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getAddress();
    }

    private String entityCustomerPhoneNumber(Order order) {
        Customer customer = order.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getPhoneNumber();
    }

    private Integer entityEmployeeIdEmployee(Order order) {
        Employee employee = order.getEmployee();
        if ( employee == null ) {
            return null;
        }
        return employee.getIdEmployee();
    }

    private String entityEmployeeEmployeeName(Order order) {
        Employee employee = order.getEmployee();
        if ( employee == null ) {
            return null;
        }
        return employee.getEmployeeName();
    }

    private Integer detailProductIdProduct(OrderDetail orderDetail) {
        Product product = orderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }

    private String detailProductSku(OrderDetail orderDetail) {
        Product product = orderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getSku();
    }
}
