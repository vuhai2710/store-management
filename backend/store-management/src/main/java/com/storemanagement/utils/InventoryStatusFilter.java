package com.storemanagement.utils;

/**
 * Enum để lọc sản phẩm theo trạng thái tồn kho
 *
 * - COMING_SOON: Hàng sắp về (đã thêm vào sản phẩm nhưng chưa thêm vào kho)
 *   - stockQuantity = 0 hoặc null
 *   - status != DISCONTINUED
 *
 * - IN_STOCK: Còn hàng
 *   - stockQuantity > 0
 *
 * - OUT_OF_STOCK: Hết hàng
 *   - stockQuantity = 0 hoặc null
 *   - status = OUT_OF_STOCK
 */
public enum InventoryStatusFilter {
    COMING_SOON,  // Hàng sắp về
    IN_STOCK,     // Còn hàng
    OUT_OF_STOCK  // Hết hàng
}

