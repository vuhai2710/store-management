import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderStatusChart = () => {
  const data = {
    labels: ['Đã hoàn thành', 'Đang xử lý', 'Chờ xác nhận', 'Đã hủy'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          '#52c41a',
          '#1890ff',
          '#faad14',
          '#ff4d4f',
        ],
        borderColor: [
          '#52c41a',
          '#1890ff',
          '#faad14',
          '#ff4d4f',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default OrderStatusChart;


