import React, { useEffect, useState } from "react";
import { useReturnService } from "../../hooks/useReturnService";
import ReturnTimeline from "../../components/returns/ReturnTimeline";

const ReturnDetailPage = ({ returnId, setCurrentPage }) => {
  const { getReturnDetail, loading } = useReturnService();
  const [returnData, setReturnData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!returnId) {
        setError("Không có ID yêu cầu");
        return;
      }
      try {
        const response = await getReturnDetail(returnId);
        console.log("Return detail response:", response);
        // API đã unwrap response.data nên response chính là data
        setReturnData(response);
      } catch (err) {
        console.error("Error fetching return detail:", err);
        setError(err.message || "Không thể tải thông tin");
      }
    };
    fetchDetail();
  }, [returnId]);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error)
    return <div className="p-8 text-center text-red-600">Lỗi: {error}</div>;
  if (!returnData)
    return <div className="p-8 text-center">Không tìm thấy yêu cầu</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Yêu cầu Đổi / Trả #{returnData.idReturn}
        </h1>
        <button
          onClick={() => setCurrentPage("return-history")}
          className="text-blue-600 hover:underline">
          &larr; Quay lại danh sách
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {returnData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">
                      {item.productName || "Sản phẩm"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng trả: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đơn giá:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        item.lineRefundAmount ??
                          (item.price || 0) * (item.quantity || 0)
                      )}
                    </span>
                    <p className="text-xs text-gray-400">Tiền hoàn</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Lý do</h2>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">
              {returnData.reason}
            </p>
          </div>

          {/* Timeline hiển thị quá trình xử lý */}
          <ReturnTimeline
            status={returnData.status}
            returnType={returnData.returnType}
            createdAt={returnData.createdAt}
            updatedAt={returnData.updatedAt}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-gray-900 mb-4">
              Thông tin chung
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái hiện tại</span>
                <span
                  className={`font-medium px-2 py-1 rounded text-sm ${
                    returnData.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : returnData.status === "APPROVED"
                      ? "bg-blue-100 text-blue-800"
                      : returnData.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : returnData.status === "PROCESSING"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {returnData.status === "REQUESTED" ||
                  returnData.status === "PENDING"
                    ? "Chờ xử lý"
                    : returnData.status === "PROCESSING"
                    ? "Đang xử lý"
                    : returnData.status === "APPROVED"
                    ? "Đã duyệt"
                    : returnData.status === "REJECTED"
                    ? "Từ chối"
                    : returnData.status === "COMPLETED"
                    ? "Hoàn thành"
                    : returnData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loại yêu cầu</span>
                <span className="font-medium">
                  {returnData.returnType === "RETURN" ? "Trả hàng" : "Đổi hàng"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày tạo</span>
                <span className="text-sm">
                  {new Date(returnData.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              {returnData.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="text-sm font-medium">
                    #{returnData.orderId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Price Breakdown */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-gray-900 mb-4">
              Chi tiết đơn hàng gốc
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng tiền sản phẩm:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(returnData.orderTotalAmount || 0)}
                </span>
              </div>

              {/* Promotion Info */}
              {(returnData.orderPromotionCode ||
                returnData.orderPromotionName) && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Giảm giá (
                    {returnData.orderPromotionCode ||
                      returnData.orderPromotionName}
                    {returnData.orderPromotionScope === "SHIPPING"
                      ? " - Phí ship"
                      : ""}
                    {returnData.orderPromotionDiscountType === "PERCENTAGE" &&
                    returnData.orderPromotionDiscountValue
                      ? ` -${returnData.orderPromotionDiscountValue}%`
                      : ""}
                    ):
                  </span>
                  <span>
                    -
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(returnData.orderDiscount || 0)}
                  </span>
                </div>
              )}

              {/* Discount without code */}
              {!returnData.orderPromotionCode &&
                !returnData.orderPromotionName &&
                returnData.orderDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(returnData.orderDiscount || 0)}
                    </span>
                  </div>
                )}

              {/* Shipping fee */}
              {returnData.orderShippingFee > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Phí vận chuyển (không hoàn):</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(returnData.orderShippingFee || 0)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Thành tiền đơn hàng:</span>
                <span className="text-blue-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(returnData.orderFinalAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-gray-900 mb-2">
              Tổng tiền hoàn lại
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(returnData.refundAmount || 0)}
            </div>
          </div>

          {returnData.noteAdmin && (
            <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-400">
              <h3 className="font-semibold text-gray-900 mb-2">
                Ghi chú từ Admin
              </h3>
              <p className="text-sm text-gray-700">{returnData.noteAdmin}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailPage;
