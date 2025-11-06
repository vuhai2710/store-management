package com.storemanagement.service.impl;

import com.storemanagement.dto.request.AddToCartRequestDto;
import com.storemanagement.dto.request.UpdateCartItemRequestDto;
import com.storemanagement.dto.response.CartDto;
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

    /**
     * Lấy giỏ hàng của customer
     * 
     * Logic:
     * - Kiểm tra customer đã có giỏ hàng chưa
     * - Nếu chưa có → Tự động tạo giỏ hàng mới
     * - Nếu đã có → Trả về giỏ hàng hiện tại
     * - Tính tổng tiền và số lượng items tự động
     */
    @Override
    @Transactional(readOnly = true)
    public CartDto getCart(Integer customerId) {
        Cart cart = getOrCreateCart(customerId);
        return cartMapper.toDto(cart);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * 
     * Logic xử lý:
     * 1. Lấy hoặc tạo giỏ hàng cho customer
     * 2. Kiểm tra sản phẩm tồn tại
     * 3. Validate trạng thái sản phẩm (không cho OUT_OF_STOCK, DISCONTINUED)
     * 4. Validate tồn kho (stockQuantity >= quantity)
     * 5. Kiểm tra sản phẩm đã có trong giỏ chưa:
     *    - Nếu đã có → Cộng thêm quantity vào số lượng hiện tại
     *    - Nếu chưa có → Tạo cart item mới
     * 6. Validate lại tồn kho sau khi cộng (nếu item đã tồn tại)
     * 7. Trả về giỏ hàng đã được cập nhật
     */
    @Override
    public CartDto addToCart(Integer customerId, AddToCartRequestDto request) {
        // Bước 1: Lấy hoặc tạo giỏ hàng
        Cart cart = getOrCreateCart(customerId);
        
        // Bước 2: Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        // Bước 3: Validate trạng thái sản phẩm
        // Không cho phép thêm sản phẩm đã hết hàng hoặc ngừng kinh doanh
        if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            throw new RuntimeException("Sản phẩm đã hết hàng");
        }
        if (product.getStatus() == ProductStatus.DISCONTINUED) {
            throw new RuntimeException("Sản phẩm đã ngừng kinh doanh");
        }

        // Bước 4: Validate tồn kho
        // Kiểm tra số lượng sản phẩm còn lại có đủ không
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + product.getStockQuantity());
        }

        // Bước 5: Kiểm tra sản phẩm đã có trong giỏ chưa
        // Nếu đã có thì cộng thêm quantity, nếu chưa thì tạo mới
        CartItem existingItem = cartItemRepository
                .findByCartIdCartAndProductIdProduct(cart.getIdCart(), product.getIdProduct())
                .orElse(null);

        if (existingItem != null) {
            // Sản phẩm đã có trong giỏ → Cộng thêm quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            
            // Validate lại tồn kho sau khi cộng
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + product.getStockQuantity());
            }
            
            // Cập nhật số lượng
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            // Sản phẩm chưa có trong giỏ → Tạo cart item mới
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        // Trả về giỏ hàng đã được cập nhật
        return getCart(customerId);
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * 
     * Logic xử lý:
     * 1. Lấy cart và cart item
     * 2. Kiểm tra quyền: Cart item phải thuộc về giỏ hàng của customer hiện tại
     * 3. Validate tồn kho: Số lượng mới không được vượt quá stockQuantity
     * 4. Cập nhật quantity
     * 5. Trả về giỏ hàng đã được cập nhật
     */
    @Override
    public CartDto updateCartItem(Integer customerId, Integer itemId, UpdateCartItemRequestDto request) {
        // Lấy giỏ hàng của customer
        Cart cart = getOrCreateCart(customerId);
        
        // Lấy cart item cần cập nhật
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        // Kiểm tra quyền: Cart item phải thuộc về giỏ hàng của customer hiện tại
        // Đảm bảo customer không thể sửa giỏ hàng của customer khác
        if (!cartItem.getCart().getIdCart().equals(cart.getIdCart())) {
            throw new RuntimeException("Không có quyền cập nhật sản phẩm này");
        }

        // Lấy thông tin sản phẩm để validate tồn kho
        Product product = cartItem.getProduct();
        
        // Validate tồn kho: Số lượng mới không được vượt quá số lượng còn lại
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ. Còn lại: " + product.getStockQuantity());
        }

        // Cập nhật số lượng
        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        // Trả về giỏ hàng đã được cập nhật
        return getCart(customerId);
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * 
     * Logic xử lý:
     * 1. Lấy cart và cart item
     * 2. Kiểm tra quyền: Cart item phải thuộc về giỏ hàng của customer hiện tại
     * 3. Xóa cart item khỏi database
     * 4. Trả về giỏ hàng đã được cập nhật
     */
    @Override
    public CartDto removeCartItem(Integer customerId, Integer itemId) {
        // Lấy giỏ hàng của customer
        Cart cart = getOrCreateCart(customerId);
        
        // Lấy cart item cần xóa
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        // Kiểm tra quyền: Cart item phải thuộc về giỏ hàng của customer hiện tại
        if (!cartItem.getCart().getIdCart().equals(cart.getIdCart())) {
            throw new RuntimeException("Không có quyền xóa sản phẩm này");
        }

        // Xóa cart item
        cartItemRepository.delete(cartItem);
        
        // Trả về giỏ hàng đã được cập nhật
        return getCart(customerId);
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * 
     * Logic: Xóa tất cả cart items, giỏ hàng vẫn tồn tại
     */
    @Override
    public void clearCart(Integer customerId) {
        Cart cart = getOrCreateCart(customerId);
        // Xóa tất cả items trong giỏ hàng
        cartItemRepository.deleteByCartIdCart(cart.getIdCart());
    }

    /**
     * Lấy hoặc tạo giỏ hàng cho customer
     * 
     * Logic:
     * - Kiểm tra customer đã có giỏ hàng chưa
     * - Nếu chưa có → Tự động tạo giỏ hàng mới
     * - Đảm bảo mỗi customer chỉ có 1 giỏ hàng
     */
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

