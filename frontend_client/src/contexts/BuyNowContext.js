// src/contexts/BuyNowContext.js
import React, { createContext, useState, useContext, useCallback } from "react";

/**
 * BuyNowContext - Lưu trữ thông tin sản phẩm khi user nhấn "Mua Ngay"
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. User nhấn "Mua Ngay" trên ProductDetailPage
 * 2. FE lưu productId + quantity vào BuyNowContext
 * 3. FE điều hướng sang CheckoutPage
 * 4. CheckoutPage detect có buyNowItem → hiển thị sản phẩm đó thay vì giỏ hàng
 * 5. User chọn địa chỉ, phương thức thanh toán, xem phí ship
 * 6. User nhấn "Đặt hàng" → gọi API buy-now
 * 7. Clear BuyNowContext sau khi đặt hàng thành công
 */

const BuyNowContext = createContext(null);

export const BuyNowProvider = ({ children }) => {
  // Thông tin sản phẩm muốn mua ngay
  const [buyNowItem, setBuyNowItem] = useState(null);

  /**
   * Thiết lập sản phẩm cho Buy Now
   * @param {Object} item - Thông tin sản phẩm
   * @param {number} item.productId - ID sản phẩm
   * @param {number} item.quantity - Số lượng muốn mua
   * @param {Object} item.product - Thông tin chi tiết sản phẩm (optional, để hiển thị trên checkout)
   */
  const setBuyNow = useCallback((item) => {
    if (item && item.productId && item.quantity > 0) {
      setBuyNowItem({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product || null, // Thông tin product để hiển thị (tránh gọi API lại)
      });
    } else {
      console.warn("BuyNowContext: Invalid buy now item", item);
    }
  }, []);

  /**
   * Xóa thông tin Buy Now (sau khi đặt hàng thành công hoặc user cancel)
   */
  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null);
  }, []);

  /**
   * Kiểm tra có đang trong mode Buy Now không
   */
  const isBuyNowMode = buyNowItem !== null;

  return (
    <BuyNowContext.Provider
      value={{
        buyNowItem,
        setBuyNow,
        clearBuyNow,
        isBuyNowMode,
      }}
    >
      {children}
    </BuyNowContext.Provider>
  );
};

/**
 * Hook để sử dụng BuyNowContext
 */
export const useBuyNow = () => {
  const context = useContext(BuyNowContext);
  if (!context) {
    throw new Error("useBuyNow must be used within a BuyNowProvider");
  }
  return context;
};

export default BuyNowContext;
