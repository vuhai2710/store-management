package com.storemanagement.mapper;

import com.storemanagement.dto.cart.CartDTO;
import com.storemanagement.dto.cart.CartItemDTO;
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
    date = "2025-11-19T16:52:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Override
    public CartDTO toDTO(Cart cart) {
        if ( cart == null ) {
            return null;
        }

        CartDTO.CartDTOBuilder<?, ?> cartDTO = CartDTO.builder();

        cartDTO.idCart( cart.getIdCart() );
        cartDTO.idCustomer( cartCustomerIdCustomer( cart ) );

        cartDTO.cartItems( mapCartItems(cart.getCartItems()) );
        cartDTO.totalAmount( calculateTotalAmount(cart.getCartItems()) );
        cartDTO.totalItems( calculateTotalItems(cart.getCartItems()) );

        return cartDTO.build();
    }

    @Override
    public CartItemDTO toCartItemDTO(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }

        CartItemDTO.CartItemDTOBuilder cartItemDTO = CartItemDTO.builder();

        cartItemDTO.idCartItem( cartItem.getIdCartItem() );
        cartItemDTO.idProduct( cartItemProductIdProduct( cartItem ) );
        cartItemDTO.productName( cartItemProductProductName( cartItem ) );
        cartItemDTO.productCode( cartItemProductProductCode( cartItem ) );
        cartItemDTO.productImageUrl( cartItemProductImageUrl( cartItem ) );
        cartItemDTO.productPrice( cartItemProductPrice( cartItem ) );
        cartItemDTO.productStockQuantity( cartItemProductStockQuantity( cartItem ) );
        cartItemDTO.quantity( cartItem.getQuantity() );

        cartItemDTO.subtotal( calculateSubtotal(cartItem.getProduct().getPrice(), cartItem.getQuantity()) );

        return cartItemDTO.build();
    }

    @Override
    public List<CartItemDTO> toCartItemDTOList(List<CartItem> cartItems) {
        if ( cartItems == null ) {
            return null;
        }

        List<CartItemDTO> list = new ArrayList<CartItemDTO>( cartItems.size() );
        for ( CartItem cartItem : cartItems ) {
            list.add( toCartItemDTO( cartItem ) );
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
