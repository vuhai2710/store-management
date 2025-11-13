# Cart Bug Fix (Sửa lỗi xóa sản phẩm khỏi giỏ hàng)

## Vấn đề

- Response thành công nhưng sản phẩm vẫn còn trong giỏ hàng
- Nguyên nhân: Transaction chưa được flush trước khi getCart() được gọi
- Hibernate cache có thể trả về dữ liệu cũ

## Giải pháp

Thêm `flush()` và reload cart từ database sau khi delete để đảm bảo dữ liệu mới nhất.

## Implementation

### File đã sửa

- `src/main/java/com/storemanagement/service/impl/CartServiceImpl.java`
  - Method `removeCartItem()`: Thêm `flush()` và reload cart

### Code changes

```java
@Override
public CartDTO removeCartItem(Integer customerId, Integer itemId) {
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
    // Flush transaction để commit ngay lập tức, tránh cache issue
    cartItemRepository.flush();

    // Reload cart từ database để đảm bảo dữ liệu mới nhất (sau khi đã flush)
    Cart updatedCart = cartRepository.findByCustomerIdCustomer(customerId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giỏ hàng"));

    return cartMapper.toDTO(updatedCart);
}
```

## Testing

### Test Cases

1. **Xóa sản phẩm khỏi giỏ hàng:**
   - Test xóa sản phẩm khỏi giỏ hàng
   - Verify sản phẩm đã bị xóa khỏi database
   - Verify response trả về giỏ hàng đã được cập nhật (không còn sản phẩm đã xóa)

2. **Xóa sản phẩm không tồn tại:**
   - Test xóa sản phẩm không tồn tại (should return 404)

3. **Xóa sản phẩm không thuộc về customer:**
   - Test xóa sản phẩm không thuộc về customer hiện tại (should return error)

## API Endpoint

**Endpoint:** `DELETE /api/v1/cart/items/{itemId}`

**Authentication:** Required (CUSTOMER role)

**Response:**
```json
{
  "code": 200,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "data": {
    "idCart": 1,
    "cartItems": [],
    "totalAmount": 0,
    "totalItems": 0
  }
}
```

