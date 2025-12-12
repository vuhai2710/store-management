package com.storemanagement.utils;

public enum InventoryStatusFilter {
    COMING_SOON,  // Hàng sắp về
    IN_STOCK,     // Còn hàng (stockQuantity >= 10)
    LOW_STOCK,    // Sắp hết hàng (0 < stockQuantity < 10)
    OUT_OF_STOCK  // Hết hàng (stockQuantity = 0)
}