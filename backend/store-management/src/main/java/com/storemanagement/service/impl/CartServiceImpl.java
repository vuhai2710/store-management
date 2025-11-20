package com.storemanagement.service.impl;

import com.storemanagement.dto.cart.CartDTO;
import com.storemanagement.dto.cart.AddToCartRequestDto;
import com.storemanagement.dto.cart.UpdateCartItemRequestDto;
import com.storemanagement.mapper.CartMapper;
import com.storemanagement.model.Cart;
import com.storemanagement.model.CartItem;
import com.storemanagement.model.Customer;
import com.storemanagement.model.Product;
import com.storemanagement.repository.CartItemRepository;
import com.storemanagement.repository.CartRepository;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.service.CartService;
import com.storemanagement.utils.ProductStatus;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional(readOnly = true)
    public CartDTO getCart(Integer customerId) {
        Cart cart = getOrCreateCart(customerId);
        return cartMapper.toDTO(cart);
    }

    @Override
    public CartDTO addToCart(Integer customerId, AddToCartRequestDto request) {
        Cart cart = getOrCreateCart(customerId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            throw new RuntimeException("Sản phẩm đã hết hàng");
        }
        if (product.getStatus() == ProductStatus.DISCONTINUED) {
            throw new RuntimeException("Sản phẩm đã ngừng kinh doanh");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + product.getStockQuantity());
        }

        CartItem existingItem = cartItemRepository
                .findByCartIdCartAndProductIdProduct(cart.getIdCart(), product.getIdProduct())
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + product.getStockQuantity());
            }

            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        return getCart(customerId);
    }

    @Override
    public CartDTO updateCartItem(Integer customerId, Integer itemId, UpdateCartItemRequestDto request) {
        Cart cart = getOrCreateCart(customerId);

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!cartItem.getCart().getIdCart().equals(cart.getIdCart())) {
            throw new RuntimeException("Không có quyền cập nhật sản phẩm này");
        }

        Product product = cartItem.getProduct();

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + product.getStockQuantity());
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return getCart(customerId);
    }

    @Override
    public CartDTO removeCartItem(Integer customerId, Integer itemId) {
        Cart cart = getOrCreateCart(customerId);

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!cartItem.getCart().getIdCart().equals(cart.getIdCart())) {
            throw new RuntimeException("Không có quyền xóa sản phẩm này");
        }

        cart.getCartItems().remove(cartItem);
        cartRepository.save(cart);

        return cartMapper.toDTO(cart);
    }

    @Override
    public void clearCart(Integer customerId) {
        Cart cart = getOrCreateCart(customerId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Integer customerId) {
        return cartRepository.findByCustomerIdCustomer(customerId)
                .orElseGet(() -> {
                    // Customer chưa có giỏ hàng → Tạo mới
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .cartItems(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}

