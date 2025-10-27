/**
 * Custom Hook - usePagination
 * Hook để quản lý pagination state
 */

import { useState } from "react";
import { APP_CONFIG } from "../constants";

export const usePagination = (
  initialPage = 1,
  initialPageSize = APP_CONFIG.PAGE_SIZE
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi page size
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
    setTotal(0);
  };

  return {
    currentPage,
    pageSize,
    total,
    setTotal,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    pagination: {
      current: currentPage,
      pageSize,
      total,
      showSizeChanger: true,
      showTotal: (total) => `Tổng ${total} bản ghi`,
      pageSizeOptions: APP_CONFIG.PAGE_SIZE_OPTIONS,
      onChange: handlePageChange,
      onShowSizeChange: handlePageSizeChange,
    },
  };
};
