import React, { useEffect, useState, useCallback } from "react";
import { useReturnService } from "../../hooks/useReturnService";
import { useDebounce } from "../../hooks/useDebounce";
import { Search } from "lucide-react";

const ReturnHistoryPage = ({ setCurrentPage, setSelectedReturnId }) => {
  const { getMyReturns, loading } = useReturnService();
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Search state
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Status options phải khớp với BE: REQUESTED, APPROVED, REJECTED, COMPLETED
  const statusOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "REQUESTED", label: "Chờ xử lý" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
    { value: "COMPLETED", label: "Hoàn thành" },
  ];

  const typeOptions = [
    { value: "ALL", label: "Tất cả loại" },
    { value: "RETURN", label: "Trả hàng" },
    { value: "EXCHANGE", label: "Đổi hàng" },
  ];

  useEffect(() => {
    fetchReturns();
  }, []);

  // Apply filters when returns or filter values change
  useEffect(() => {
    let result = [...returns];

    if (statusFilter !== "ALL") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (typeFilter !== "ALL") {
      result = result.filter((item) => item.returnType === typeFilter);
    }

    // Apply keyword search
    if (debouncedKeyword && debouncedKeyword.trim()) {
      const keyword = debouncedKeyword.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.idReturn?.toString().includes(keyword) ||
          item.reason?.toLowerCase().includes(keyword)
      );
    }

    setFilteredReturns(result);
  }, [returns, statusFilter, typeFilter, debouncedKeyword]);

  const fetchReturns = async () => {
    try {
      const data = await getMyReturns({ pageNo: 1, pageSize: 100 }); // Fetch more for client-side filtering
      setReturns(data.content || []);
      setPagination({
        page: data.pageNo,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error(error);
      setReturns([]);
    }
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  if (loading && returns.length === 0)
    return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử Đổi / Trả hàng</h1>

      {/* Filters */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã phiếu, lý do..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại yêu cầu
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              Đặt lại
            </button>
          </div>
        </div>

        {/* Filter summary */}
        <div className="mt-3 text-sm text-gray-500">
          Hiển thị {filteredReturns.length} / {returns.length} yêu cầu
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã phiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hoàn tiền
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReturns.map((item) => (
              <tr key={item.idReturn}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{item.idReturn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.returnType === "RETURN" ? "Trả hàng" : "Đổi hàng"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      item.status
                    )}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.refundAmount
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.refundAmount)
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedReturnId(item.idReturn);
                      setCurrentPage("return-detail");
                    }}
                    className="text-blue-600 hover:text-blue-900">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReturns.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Không có yêu cầu đổi trả nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnHistoryPage;
