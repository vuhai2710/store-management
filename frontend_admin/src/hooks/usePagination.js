import { useState, useCallback, useMemo } from "react";
import { APP_CONFIG } from "../constants";

export const usePagination = (
  initialPage = 1,
  initialPageSize = APP_CONFIG.PAGE_SIZE
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const handlePageChange = useCallback((page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== undefined) {
      setPageSize(newPageSize);
    }
  }, []);

  const handlePageSizeChange = useCallback((current, size) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      pageSize,
      total,
      showSizeChanger: true,
      showTotal: (total) => `Tổng ${total} bản ghi`,
      pageSizeOptions: APP_CONFIG.PAGE_SIZE_OPTIONS,
      onChange: handlePageChange,
      onShowSizeChange: handlePageSizeChange,
    }),
    [currentPage, pageSize, total, handlePageChange, handlePageSizeChange]
  );

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
