import React, { useState, useEffect } from "react";

const ReturnItemCard = ({
  item,
  isSelected,
  onSelect,
  onQuantityChange,
  maxQuantity,
  returnQuantity = 1,
}) => {
  const [quantity, setQuantity] = useState(returnQuantity);

  useEffect(() => {
    setQuantity(returnQuantity);
  }, [returnQuantity]);

  const handleQuantityChange = (newValue) => {

    let validValue = parseInt(newValue) || 1;
    if (validValue < 1) validValue = 1;
    if (validValue > maxQuantity) validValue = maxQuantity;

    setQuantity(validValue);
    onQuantityChange(validValue);
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      handleQuantityChange(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const productName =
    item.productNameSnapshot ||
    item.productName ||
    item.product?.productName ||
    "Sản phẩm";
  const price = item.price || item.product?.price || 0;
  const purchasedQuantity = item.quantity || maxQuantity || 1;

  return (
    <div
      className={`border p-4 rounded-lg mb-4 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}>
      <div className="flex items-start gap-4">
        {}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="mt-1.5 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />

        {}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{productName}</h4>
          <p className="text-sm text-gray-500 mt-1">
            Đơn giá:{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price)}
          </p>
          <p className="text-sm text-blue-600 font-medium mt-1">
            Số lượng đã mua: {purchasedQuantity}
          </p>
        </div>

        {}
        {isSelected && (
          <div className="flex flex-col items-end gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Số lượng đổi/trả:
            </label>
            <div className="flex items-center gap-1">
              {}
              <button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-lg
                  ${
                    quantity <= 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300 cursor-pointer"
                  }`}>
                −
              </button>

              {}
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-14 border border-gray-300 rounded px-2 py-1 text-center text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {}
              <button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
                className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-lg
                  ${
                    quantity >= maxQuantity
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300 cursor-pointer"
                  }`}>
                +
              </button>
            </div>

            {}
            <p className="text-xs text-gray-500">Tối đa: {maxQuantity}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnItemCard;
