import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useReturnService } from "../../hooks/useReturnService";
import ReturnItemCard from "../../components/returns/ReturnItemCard";
import api from "../../services/api";
import { parseBackendDate } from "../../utils/formatUtils";

const RequestReturnPage = ({ orderId, setCurrentPage }) => {
  const {
    requestReturn,
    requestExchange,
    loading: submitting,
    getReturnPeriodDays,
  } = useReturnService();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returnType, setReturnType] = useState("RETURN");
  const [selectedItems, setSelectedItems] = useState({});
  const [reason, setReason] = useState("");
  const [returnPeriodDays, setReturnPeriodDays] = useState(7);

  const isWithinReturnPeriod = useCallback((orderData, fallbackDays) => {

    const orderReturnWindowDays = orderData?.returnWindowDays ?? fallbackDays;

    if (orderReturnWindowDays === 0 || orderReturnWindowDays == null)
      return true;

    const baseTimeStr =
      orderData?.completedAt || orderData?.deliveredAt || orderData?.orderDate;
    if (!baseTimeStr) return true;

    const baseTime = parseBackendDate(baseTimeStr);
    if (!baseTime) return true;

    const deadline = new Date(baseTime);
    deadline.setDate(deadline.getDate() + orderReturnWindowDays);

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const deadlineEnd = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate(),
      23,
      59,
      59
    );

    return todayStart <= deadlineEnd;
  }, []);

  useEffect(() => {
    const loadReturnPeriod = async () => {
      const days = await getReturnPeriodDays();
      setReturnPeriodDays(days);
    };
    loadReturnPeriod();
  }, [getReturnPeriodDays]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError("No Order ID provided");
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {

      const orderReturnWindowDays = order.returnWindowDays ?? returnPeriodDays;

      if (!isWithinReturnPeriod(order, returnPeriodDays)) {
        toast.warning(
          `Đơn hàng đã vượt quá thời gian đổi trả (${orderReturnWindowDays} ngày)`
        );
        setCurrentPage("return-history");
      }
    }
  }, [order, returnPeriodDays, isWithinReturnPeriod, setCurrentPage]);

  const fetchOrderDetails = async () => {
    try {
      console.log("Fetching order details for ID:", orderId);
      const response = await api.get(`/orders/my-orders/${orderId}`);
      console.log("Order details response:", response.data);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item, isSelected) => {
    const itemId = item.idOrderDetail || item.id;
    setSelectedItems((prev) => {
      const newItems = { ...prev };
      if (isSelected) {
        newItems[itemId] = {
          ...item,
          returnQuantity: 1,
          idOrderDetail: itemId,
        };
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
  };

  const handleQuantityChange = (itemId, qty) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], returnQuantity: qty },
    }));
  };

  const handleSubmit = async () => {
    const items = Object.values(selectedItems).map((item) => ({
      idOrderDetail: item.idOrderDetail,
      quantity: item.returnQuantity,
    }));

    if (items.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }

    const payload = {
      orderId: parseInt(orderId),
      returnType,
      reason,
      items,
    };

    try {
      if (returnType === "RETURN") {
        await requestReturn(orderId, payload);
      } else {
        await requestExchange(orderId, payload);
      }
      setCurrentPage("return-history");
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">Đang tải thông tin đơn hàng...</div>
    );
  if (error)
    return <div className="p-8 text-center text-red-600">Lỗi: {error}</div>;
  if (!order)
    return <div className="p-8 text-center">Không tìm thấy đơn hàng</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Yêu cầu Đổi / Trả hàng</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="text-gray-600">Đơn hàng #{order.idOrder || order.id}</p>
        <p className="text-sm text-gray-500">
          Ngày đặt: {new Date(order.orderDate).toLocaleDateString("vi-VN")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Tôi muốn:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="returnType"
              value="RETURN"
              checked={returnType === "RETURN"}
              onChange={(e) => setReturnType(e.target.value)}
            />
            <span>Trả hàng & Hoàn tiền</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="returnType"
              value="EXCHANGE"
              checked={returnType === "EXCHANGE"}
              onChange={(e) => setReturnType(e.target.value)}
            />
            <span>Đổi sản phẩm khác</span>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-3">Chọn sản phẩm cần đổi/trả</h3>
        {order.orderDetails.map((item, index) => {
          const itemId = item.idOrderDetail || item.id;
          const selectedItem = selectedItems[itemId];
          return (
            <div key={itemId || index}>
              <ReturnItemCard
                item={item}
                isSelected={!!selectedItem}
                onSelect={(checked) => handleSelectItem(item, checked)}
                onQuantityChange={(qty) => handleQuantityChange(itemId, qty)}
                maxQuantity={item.quantity}
                returnQuantity={selectedItem?.returnQuantity || 1}
              />
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Lý do</label>
        <textarea
          className="w-full border rounded p-3"
          rows="4"
          placeholder="Tại sao bạn muốn đổi/trả sản phẩm này?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}></textarea>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400">
        {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
      </button>
    </div>
  );
};

export default RequestReturnPage;
