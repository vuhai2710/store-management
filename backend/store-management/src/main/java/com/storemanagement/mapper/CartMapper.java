package com.storemanagement.mapper;

import com.storemanagement.dto.response.CartDto;
import com.storemanagement.dto.response.CartItemDto;
import com.storemanagement.model.Cart;
import com.storemanagement.model.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(target = "idCustomer", source = "customer.idCustomer")
    @Mapping(target = "cartItems", expression = "java(mapCartItems(cart.getCartItems()))")
    @Mapping(target = "totalAmount", expression = "java(calculateTotalAmount(cart.getCartItems()))")
    @Mapping(target = "totalItems", expression = "java(calculateTotalItems(cart.getCartItems()))")
    CartDto toDto(Cart cart);

    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "productImageUrl", source = "product.imageUrl")
    @Mapping(target = "productPrice", source = "product.price")
    @Mapping(target = "productStockQuantity", source = "product.stockQuantity")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(cartItem.getProduct().getPrice(), cartItem.getQuantity()))")
    CartItemDto toCartItemDto(CartItem cartItem);

    List<CartItemDto> toCartItemDtoList(List<CartItem> cartItems);

    default List<CartItemDto> mapCartItems(List<CartItem> cartItems) {
        if (cartItems == null) {
            return List.of();
        }
        return cartItems.stream()
                .map(this::toCartItemDto)
                .toList();
    }

    default BigDecimal calculateTotalAmount(List<CartItem> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return cartItems.stream()
                .map(item -> calculateSubtotal(item.getProduct().getPrice(), item.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    default Integer calculateTotalItems(List<CartItem> cartItems) {
        if (cartItems == null) {
            return 0;
        }
        return cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    default BigDecimal calculateSubtotal(Double price, Integer quantity) {
        if (price == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(price)
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(2, RoundingMode.HALF_UP);
    }
}




