import React, { useState, useEffect } from "react";
import api from "../../services/api";

const ProductSelectModal = ({
  isOpen,
  onClose,
  onSelect,
  currentProductPrice,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products", {
        params: { search: searchTerm },
      });
      setProducts(response.data?.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select Product for Exchange</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border rounded px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border p-3 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(product)}>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </p>
                    </div>
                  </div>
                  {product.price > currentProductPrice && (
                    <span className="text-xs text-orange-500">Pay extra</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelectModal;
