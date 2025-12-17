
import React, { createContext, useState, useContext, useCallback } from "react";

const BuyNowContext = createContext(null);

export const BuyNowProvider = ({ children }) => {

  const [buyNowItem, setBuyNowItem] = useState(null);

  const setBuyNow = useCallback((item) => {
    if (item && item.productId && item.quantity > 0) {
      setBuyNowItem({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product || null,
      });
    } else {
      console.warn("BuyNowContext: Invalid buy now item", item);
    }
  }, []);

  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null);
  }, []);

  const isBuyNowMode = buyNowItem !== null;

  return (
    <BuyNowContext.Provider
      value={{
        buyNowItem,
        setBuyNow,
        clearBuyNow,
        isBuyNowMode,
      }}>
      {children}
    </BuyNowContext.Provider>
  );
};

export const useBuyNow = () => {
  const context = useContext(BuyNowContext);
  if (!context) {
    throw new Error("useBuyNow must be used within a BuyNowProvider");
  }
  return context;
};

export default BuyNowContext;
