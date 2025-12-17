import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ orders = [] }) => {

  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        labels: [],
        revenueData: [],
      };
    }

    const monthlyRevenue = {};
    const monthlyProfit = {};

    orders
      .filter((order) => order.status === "COMPLETED")
      .forEach((order) => {
        if (!order.orderDate) return;

        const date = new Date(order.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            label: monthLabel,
            revenue: 0,
            profit: 0,
          };
        }

        const revenue = Number(order.totalAmount) || 0;
        const discount = Number(order.discount) || 0;
        const finalAmount = Number(order.finalAmount) || revenue;

        monthlyRevenue[monthKey].revenue += finalAmount;

        monthlyRevenue[monthKey].profit += finalAmount * 0.3;
      });

    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const labels = sortedMonths.map((key) => monthlyRevenue[key].label);
    const revenueData = sortedMonths.map((key) => monthlyRevenue[key].revenue);
    const profitData = sortedMonths.map((key) => monthlyRevenue[key].profit);

    if (labels.length === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(`Tháng ${date.getMonth() + 1}/${date.getFullYear()}`);
        revenueData.push(0);
        profitData.push(0);
      }
    }

    return { labels, revenueData, profitData };
  }, [orders]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Doanh thu",
        data: chartData.revenueData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "Lợi nhuận (ước tính)",
        data: chartData.profitData,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("vi-VN") + " VNĐ";
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default RevenueChart;
