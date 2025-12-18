import React from "react";
import { formatDate } from "../../utils/formatUtils";

const ReturnTimeline = ({ status, returnType, createdAt, updatedAt }) => {

  const getTimelineSteps = () => {
    const isReturn = returnType === "RETURN";
    const actionLabel = isReturn ? "trả hàng" : "đổi hàng";

    if (status === "REJECTED") {
      return [
        {
          key: "REQUESTED",
          label: "Đã gửi yêu cầu",
          description: `Yêu cầu ${actionLabel} đã được gửi`,
          completed: true,
          current: false,
          failed: false,
        },
        {
          key: "REJECTED",
          label: "Từ chối",
          description: `Yêu cầu ${actionLabel} bị từ chối`,
          completed: true,
          current: true,
          failed: true,
        },
      ];
    }

    return [
      {
        key: "REQUESTED",
        label: "Đã gửi yêu cầu",
        description: `Yêu cầu ${actionLabel} đã được gửi`,
        completed: [
          "REQUESTED",
          "PENDING",
          "PROCESSING",
          "APPROVED",
          "COMPLETED",
        ].includes(status),
        current: status === "REQUESTED" || status === "PENDING",
        failed: false,
      },
      {
        key: "PROCESSING",
        label: "Đang xử lý",
        description: "Nhân viên đang xem xét yêu cầu",
        completed: ["PROCESSING", "APPROVED", "COMPLETED"].includes(status),
        current: status === "PROCESSING",
        failed: false,
      },
      {
        key: "APPROVED",
        label: "Đã duyệt",
        description: `Yêu cầu ${actionLabel} được chấp nhận`,
        completed: ["APPROVED", "COMPLETED"].includes(status),
        current: status === "APPROVED",
        failed: false,
      },
      {
        key: "COMPLETED",
        label: "Hoàn thành",
        description: isReturn
          ? "Đã hoàn tiền thành công"
          : "Đã đổi hàng thành công",
        completed: status === "COMPLETED",
        current: status === "COMPLETED",
        failed: false,
      },
    ];
  };

  const steps = getTimelineSteps();

  const formatDateTimeline = (dateString) =>
    formatDate(dateString, "dd/MM/yyyy HH:mm");

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-6">Tiến trình xử lý</h2>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-start mb-8 last:mb-0">
            {}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-4 w-0.5 h-8 transform translate-y-8 ${
                  step.completed && !step.failed
                    ? "bg-green-500"
                    : step.failed
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
                style={{ top: `${index * 88 + 32}px` }}
              />
            )}

            {}
            <div
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 ${
                step.failed
                  ? "bg-red-500 border-red-500 text-white"
                  : step.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : step.current
                  ? "bg-blue-500 border-blue-500 text-white animate-pulse"
                  : "bg-white border-gray-300 text-gray-400"
              }`}>
              {step.failed ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : step.completed ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>

            {}
            <div className="ml-4 flex-1">
              <h3
                className={`font-medium ${
                  step.failed
                    ? "text-red-600"
                    : step.completed || step.current
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}>
                {step.label}
              </h3>
              <p
                className={`text-sm mt-0.5 ${
                  step.failed
                    ? "text-red-500"
                    : step.completed || step.current
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}>
                {step.description}
              </p>
              {}
              {step.completed && step.key === "REQUESTED" && createdAt && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(createdAt)}
                </p>
              )}
              {step.current && step.key !== "REQUESTED" && updatedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(updatedAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReturnTimeline;
