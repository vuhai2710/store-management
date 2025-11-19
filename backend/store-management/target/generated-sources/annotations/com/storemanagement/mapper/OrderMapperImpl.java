package com.storemanagement.mapper;

import com.storemanagement.dto.order.OrderDTO;
import com.storemanagement.dto.order.OrderDetailDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.model.Order;
import com.storemanagement.model.OrderDetail;
import com.storemanagement.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:01+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderDTO toDTO(Order entity) {
        if ( entity == null ) {
            return null;
        }

        OrderDTO.OrderDTOBuilder orderDTO = OrderDTO.builder();

        orderDTO.idOrder( entity.getIdOrder() );
        orderDTO.idCustomer( entityCustomerIdCustomer( entity ) );
        orderDTO.customerName( entityCustomerCustomerName( entity ) );
        orderDTO.customerAddress( entityCustomerAddress( entity ) );
        orderDTO.customerPhone( entityCustomerPhoneNumber( entity ) );
        orderDTO.shippingAddressSnapshot( entity.getShippingAddressSnapshot() );
        orderDTO.promotionCode( entity.getPromotionCode() );
        orderDTO.orderDate( entity.getOrderDate() );
        orderDTO.status( entity.getStatus() );
        orderDTO.totalAmount( entity.getTotalAmount() );
        orderDTO.discount( entity.getDiscount() );
        orderDTO.finalAmount( entity.getFinalAmount() );
        orderDTO.paymentMethod( entity.getPaymentMethod() );
        orderDTO.notes( entity.getNotes() );
        orderDTO.deliveredAt( entity.getDeliveredAt() );
        orderDTO.paymentLinkId( entity.getPaymentLinkId() );

        orderDTO.idEmployee( entity.getEmployee() != null ? entity.getEmployee().getIdEmployee() : null );
        orderDTO.employeeName( entity.getEmployee() != null ? entity.getEmployee().getEmployeeName() : null );
        orderDTO.idShippingAddress( entity.getShippingAddress() != null ? entity.getShippingAddress().getIdShippingAddress() : null );
        orderDTO.orderDetails( mapOrderDetails(entity.getOrderDetails()) );
        orderDTO.idPromotion( entity.getPromotion() != null ? entity.getPromotion().getIdPromotion() : null );
        orderDTO.idPromotionRule( entity.getPromotionRule() != null ? entity.getPromotionRule().getIdRule() : null );

        return orderDTO.build();
    }

    @Override
    public Order toEntity(OrderDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Order.OrderBuilder order = Order.builder();

        order.status( dto.getStatus() );
        order.totalAmount( dto.getTotalAmount() );
        order.discount( dto.getDiscount() );
        order.paymentMethod( dto.getPaymentMethod() );
        order.notes( dto.getNotes() );
        order.shippingAddressSnapshot( dto.getShippingAddressSnapshot() );
        order.deliveredAt( dto.getDeliveredAt() );
        order.paymentLinkId( dto.getPaymentLinkId() );
        order.promotionCode( dto.getPromotionCode() );

        return order.build();
    }

    @Override
    public OrderDetailDTO detailToDTO(OrderDetail detail) {
        if ( detail == null ) {
            return null;
        }

        OrderDetailDTO.OrderDetailDTOBuilder orderDetailDTO = OrderDetailDTO.builder();

        orderDetailDTO.idOrderDetail( detail.getIdOrderDetail() );
        orderDetailDTO.idProduct( detailProductIdProduct( detail ) );
        orderDetailDTO.sku( detailProductSku( detail ) );
        orderDetailDTO.productNameSnapshot( detail.getProductNameSnapshot() );
        orderDetailDTO.productCodeSnapshot( detail.getProductCodeSnapshot() );
        orderDetailDTO.productImageSnapshot( detail.getProductImageSnapshot() );
        orderDetailDTO.quantity( detail.getQuantity() );
        orderDetailDTO.price( detail.getPrice() );

        orderDetailDTO.productName( detail.getProductNameSnapshot() != null ? detail.getProductNameSnapshot() : detail.getProduct().getProductName() );
        orderDetailDTO.productCode( detail.getProductCodeSnapshot() != null ? detail.getProductCodeSnapshot() : detail.getProduct().getProductCode() );
        orderDetailDTO.subtotal( detail.getPrice().multiply(java.math.BigDecimal.valueOf(detail.getQuantity())) );

        return orderDetailDTO.build();
    }

    @Override
    public List<OrderDetailDTO> detailListToDTO(List<OrderDetail> details) {
        if ( details == null ) {
            return null;
        }

        List<OrderDetailDTO> list = new ArrayList<OrderDetailDTO>( details.size() );
        for ( OrderDetail orderDetail : details ) {
            list.add( detailToDTO( orderDetail ) );
        }

        return list;
    }

    @Override
    public List<OrderDTO> toDTOList(List<Order> orders) {
        if ( orders == null ) {
            return null;
        }

        List<OrderDTO> list = new ArrayList<OrderDTO>( orders.size() );
        for ( Order order : orders ) {
            list.add( toDTO( order ) );
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
