package com.storemanagement.mapper;

import com.storemanagement.dto.response.CartDto;
import com.storemanagement.dto.response.CartItemDto;
import com.storemanagement.model.Cart;
import com.storemanagement.model.CartItem;
import com.storemanagement.model.Customer;
import com.storemanagement.model.Product;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:23:08+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Override
    public CartDto toDto(Cart cart) {
        if ( cart == null ) {
            return null;
        }

        CartDto.CartDtoBuilder cartDto = CartDto.builder();

        cartDto.idCustomer( cartCustomerIdCustomer( cart ) );
        cartDto.idCart( cart.getIdCart() );

        cartDto.cartItems( mapCartItems(cart.getCartItems()) );
        cartDto.totalAmount( calculateTotalAmount(cart.getCartItems()) );
        cartDto.totalItems( calculateTotalItems(cart.getCartItems()) );

        return cartDto.build();
    }

    @Override
    public CartItemDto toCartItemDto(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }

        CartItemDto.CartItemDtoBuilder cartItemDto = CartItemDto.builder();

        cartItemDto.idProduct( cartItemProductIdProduct( cartItem ) );
        cartItemDto.productName( cartItemProductProductName( cartItem ) );
        cartItemDto.productCode( cartItemProductProductCode( cartItem ) );
        cartItemDto.productImageUrl( cartItemProductImageUrl( cartItem ) );
        cartItemDto.productPrice( cartItemProductPrice( cartItem ) );
        cartItemDto.productStockQuantity( cartItemProductStockQuantity( cartItem ) );
        cartItemDto.idCartItem( cartItem.getIdCartItem() );
        cartItemDto.quantity( cartItem.getQuantity() );

        cartItemDto.subtotal( calculateSubtotal(cartItem.getProduct().getPrice(), cartItem.getQuantity()) );

        return cartItemDto.build();
    }

    @Override
    public List<CartItemDto> toCartItemDtoList(List<CartItem> cartItems) {
        if ( cartItems == null ) {
            return null;
        }

        List<CartItemDto> list = new ArrayList<CartItemDto>( cartItems.size() );
        for ( CartItem cartItem : cartItems ) {
            list.add( toCartItemDto( cartItem ) );
        }

        return list;
    }

    private Integer cartCustomerIdCustomer(Cart cart) {
        Customer customer = cart.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getIdCustomer();
    }

    private Integer cartItemProductIdProduct(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }

    private String cartItemProductProductName(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductName();
    }

    private String cartItemProductProductCode(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductCode();
    }

    private String cartItemProductImageUrl(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getImageUrl();
    }

    private BigDecimal cartItemProductPrice(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getPrice();
    }

    private Integer cartItemProductStockQuantity(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getStockQuantity();
    }
}
