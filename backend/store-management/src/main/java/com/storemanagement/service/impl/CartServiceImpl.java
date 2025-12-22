package com.storemanagement.service.impl;

import com.storemanagement.dto.cart.CartDTO;
import com.storemanagement.dto.cart.CartItemDTO;
import com.storemanagement.dto.cart.AddToCartRequestDto;
import com.storemanagement.dto.cart.UpdateCartItemRequestDto;
import com.storemanagement.dto.promotion.CalculateDiscountRequestDTO;
import com.storemanagement.dto.promotion.CalculateDiscountResponseDTO;
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
import com.storemanagement.service.PromotionService;
import com.storemanagement.utils.ProductStatus;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;
    private final PromotionService promotionService;

    @Override
    @Transactional(readOnly = true)
    public CartDTO getCart(Integer customerId) {
        Cart cart = getOrCreateCart(customerId);

        // Filter out deleted products from the cart items
        if (cart.getCartItems() != null) {
            cart.getCartItems().removeIf(
                    item -> item.getProduct() != null && Boolean.TRUE.equals(item.getProduct().getIsDelete()));
        }

        CartDTO cartDTO = cartMapper.toDTO(cart);

        BigDecimal totalAmount = cartDTO.getTotalAmount() != null ? cartDTO.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal automaticDiscount = BigDecimal.ZERO;

        if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            Customer customer = cart.getCustomer();
            String customerType = customer.getCustomerType() != null
                    ? customer.getCustomerType().name()
                    : "REGULAR";

            CalculateDiscountRequestDTO request = CalculateDiscountRequestDTO.builder()
                    .totalAmount(totalAmount)
                    .customerType(customerType)
                    .build();

            CalculateDiscountResponseDTO response = promotionService.calculateAutomaticDiscount(request,
                    customerType);

            if (response != null && Boolean.TRUE.equals(response.getApplicable())
                    && response.getDiscount() != null
                    && response.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
                automaticDiscount = response.getDiscount();
                if (automaticDiscount.compareTo(totalAmount) > 0) {
                    automaticDiscount = totalAmount;
                }
            }
        }

        BigDecimal finalAmount = totalAmount.subtract(automaticDiscount).max(BigDecimal.ZERO);

        cartDTO.setAutomaticDiscount(automaticDiscount.setScale(2, RoundingMode.HALF_UP));
        cartDTO.setFinalAmount(finalAmount.setScale(2, RoundingMode.HALF_UP));

        List<CartItemDTO> items = cartDTO.getCartItems();
        if (items != null && !items.isEmpty()) {
            distributeDiscountToItems(items, totalAmount, automaticDiscount);
        }

        return cartDTO;
    }

    @Override
    public CartDTO addToCart(Integer customerId, AddToCartRequestDto request) {
        Cart cart = getOrCreateCart(customerId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        if (product.getStatus() == ProductStatus.DISCONTINUED || Boolean.TRUE.equals(product.getIsDelete())) {
            throw new RuntimeException("Sản phẩm đã ngừng kinh doanh hoặc không còn tồn tại");
        }

        int availableStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;

        if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            if (availableStock > 0) {
                product.setStatus(ProductStatus.IN_STOCK);
                productRepository.save(product);
            } else {
                throw new RuntimeException("Sản phẩm đã hết hàng");
            }
        }

        if (availableStock < request.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + availableStock);
        }

        CartItem existingItem = cartItemRepository
                .findByCartIdCartAndProductIdProduct(cart.getIdCart(), product.getIdProduct())
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (availableStock < newQuantity) {
                throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + availableStock);
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
        int availableStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;

        if (availableStock < request.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + availableStock);
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

        return getCart(customerId);
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
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .cartItems(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private void distributeDiscountToItems(List<CartItemDTO> items, BigDecimal totalAmount,
            BigDecimal automaticDiscount) {
        if (items == null || items.isEmpty()) {
            return;
        }

        if (automaticDiscount == null) {
            automaticDiscount = BigDecimal.ZERO;
        }

        if (automaticDiscount.compareTo(BigDecimal.ZERO) <= 0
                || totalAmount == null
                || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            for (CartItemDTO item : items) {
                BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
                item.setDiscountAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
                item.setDiscountedSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));

                if (item.getQuantity() != null && item.getQuantity() > 0) {
                    BigDecimal unitPrice = subtotal.divide(BigDecimal.valueOf(item.getQuantity()), 2,
                            RoundingMode.HALF_UP);
                    item.setDiscountedUnitPrice(unitPrice);
                } else {
                    item.setDiscountedUnitPrice(item.getProductPrice());
                }
            }
            return;
        }

        BigDecimal remainingDiscount = automaticDiscount;

        for (int i = 0; i < items.size(); i++) {
            CartItemDTO item = items.get(i);
            BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;

            BigDecimal itemDiscount;
            if (i == items.size() - 1) {
                itemDiscount = remainingDiscount;
            } else if (totalAmount.compareTo(BigDecimal.ZERO) > 0 && subtotal.compareTo(BigDecimal.ZERO) > 0) {
                itemDiscount = automaticDiscount.multiply(subtotal)
                        .divide(totalAmount, 2, RoundingMode.HALF_UP);
                if (itemDiscount.compareTo(remainingDiscount) > 0) {
                    itemDiscount = remainingDiscount;
                }
            } else {
                itemDiscount = BigDecimal.ZERO;
            }

            BigDecimal discountedSubtotal = subtotal.subtract(itemDiscount);
            if (discountedSubtotal.compareTo(BigDecimal.ZERO) < 0) {
                discountedSubtotal = BigDecimal.ZERO;
            }

            item.setDiscountAmount(itemDiscount.setScale(2, RoundingMode.HALF_UP));
            item.setDiscountedSubtotal(discountedSubtotal.setScale(2, RoundingMode.HALF_UP));

            if (item.getQuantity() != null && item.getQuantity() > 0) {
                BigDecimal unitPrice = discountedSubtotal.divide(BigDecimal.valueOf(item.getQuantity()), 2,
                        RoundingMode.HALF_UP);
                item.setDiscountedUnitPrice(unitPrice);
            } else {
                item.setDiscountedUnitPrice(item.getProductPrice());
            }

            remainingDiscount = remainingDiscount.subtract(itemDiscount);
            if (remainingDiscount.compareTo(BigDecimal.ZERO) < 0) {
                remainingDiscount = BigDecimal.ZERO;
            }
        }
    }
}
