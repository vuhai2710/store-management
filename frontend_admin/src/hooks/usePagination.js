/**
 * Custom Hook - usePagination
 * Hook để quản lý pagination state
 * 
 * QUAN TRỌNG: Các functions được memoize bằng useCallback để tránh
 * gây re-render không cần thiết khi được sử dụng làm dependency của useEffect
 */

import { useState, useCallback, useMemo } from "react";
import { APP_CONFIG } from "../constants";

export const usePagination = (
  initialPage = 1,
  initialPageSize = APP_CONFIG.PAGE_SIZE
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  // Memoize handlePageChange để tránh re-render không cần thiết
  const handlePageChange = useCallback((page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== undefined) {
      setPageSize(newPageSize);
    }
  }, []);

  // Memoize handlePageSizeChange
  const handlePageSizeChange = useCallback((current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi page size
  }, []);

  // Memoize resetPagination - QUAN TRỌNG: không reset total để tránh mất dữ liệu
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Memoize pagination object để tránh tạo object mới mỗi render
  const pagination = useMemo(() => ({
    current: currentPage,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (total) => `Tổng ${total} bản ghi`,
    pageSizeOptions: APP_CONFIG.PAGE_SIZE_OPTIONS,
    onChange: handlePageChange,
    onShowSizeChange: handlePageSizeChange,
  }), [currentPage, pageSize, total, handlePageChange, handlePageSizeChange]);

  return {
    currentPage,
    pageSize,
    total,
    setTotal,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    pagination,
  };
};
