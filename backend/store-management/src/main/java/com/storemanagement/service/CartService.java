package com.storemanagement.service;

import com.storemanagement.dto.request.AddToCartRequestDto;
import com.storemanagement.dto.request.UpdateCartItemRequestDto;
import com.storemanagement.dto.response.CartDto;

public interface CartService {
    CartDto getCart(Integer customerId);
    
    CartDto addToCart(Integer customerId, AddToCartRequestDto request);
    
    CartDto updateCartItem(Integer customerId, Integer itemId, UpdateCartItemRequestDto request);
    
    CartDto removeCartItem(Integer customerId, Integer itemId);
    
    void clearCart(Integer customerId);
}




