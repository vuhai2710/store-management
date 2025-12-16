import React from "react";
import ReturnsTracking from "../../components/returns/ReturnsTracking";

/**
 * Return History Page - accessed via avatar menu "Theo dõi đổi trả"
 * Uses shared ReturnsTracking component
 */
const ReturnHistoryPage = ({ setCurrentPage, setSelectedReturnId }) => {
  const handleViewDetail = (returnId) => {
    setSelectedReturnId(returnId);
    setCurrentPage("return-detail");
  };

  return (
    <ReturnsTracking
      embedded={false}
      onViewDetail={handleViewDetail}
    />
  );
};

export default ReturnHistoryPage;
