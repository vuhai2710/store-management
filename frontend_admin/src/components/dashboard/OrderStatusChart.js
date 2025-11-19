import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ORDER_STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

const ORDER_STATUS_COLORS = {
  PENDING: {
    bg: "rgba(255, 206, 86, 0.2)",
    border: "rgba(255, 206, 86, 1)",
  },
  CONFIRMED: {
    bg: "rgba(54, 162, 235, 0.2)",
    border: "rgba(54, 162, 235, 1)",
  },
  COMPLETED: {
    bg: "rgba(75, 192, 192, 0.2)",
    border: "rgba(75, 192, 192, 1)",
  },
  CANCELED: {
    bg: "rgba(255, 99, 132, 0.2)",
    border: "rgba(255, 99, 132, 1)",
  },
};

const OrderStatusChart = ({ ordersByStatus = {} }) => {
  const chartData = useMemo(() => {
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];

    Object.entries(ordersByStatus).forEach(([status, count]) => {
      if (count > 0) {
        labels.push(ORDER_STATUS_LABELS[status] || status);
        data.push(count);
        const colors = ORDER_STATUS_COLORS[status] || {
          bg: "rgba(128, 128, 128, 0.2)",
          border: "rgba(128, 128, 128, 1)",
        };
        backgroundColors.push(colors.bg);
        borderColors.push(colors.border);
      }
    });

    // If no data, show empty state
    if (labels.length === 0) {
      labels.push("Chưa có dữ liệu");
      data.push(1);
      backgroundColors.push("rgba(200, 200, 200, 0.2)");
      borderColors.push("rgba(200, 200, 200, 1)");
    }

    return {
      labels,
      datasets: [
        {
          label: "Số lượng đơn hàng",
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [ordersByStatus]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default OrderStatusChart;
