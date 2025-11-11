package com.storemanagement.service;

import com.storemanagement.dto.cart.CartDTO;
import com.storemanagement.dto.cart.AddToCartRequestDto;
import com.storemanagement.dto.cart.UpdateCartItemRequestDto;

public interface CartService {
    CartDTO getCart(Integer customerId);
    
    CartDTO addToCart(Integer customerId, AddToCartRequestDto request);
    
    CartDTO updateCartItem(Integer customerId, Integer itemId, UpdateCartItemRequestDto request);
    
    CartDTO removeCartItem(Integer customerId, Integer itemId);
    
    void clearCart(Integer customerId);
}




