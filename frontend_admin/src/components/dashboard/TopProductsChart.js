import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Empty, Spin } from "antd";
import { productsService } from "../../services/productsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsChart = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setLoading(true);
        // Fetch top 5 best-selling products using new API
        const products = await productsService.getTop5BestSellingProducts({
          status: "COMPLETED",
        });
        // Response is List<ProductDTO>, not PageResponse
        setTopProducts(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error("Error loading top products:", error);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin />
      </div>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return <Empty description="Chưa có dữ liệu sản phẩm bán chạy" />;
  }

  // Note: Backend may not provide totalSold field directly in ProductDTO
  // We'll use productName and assume backend sorts by sales
  const data = {
    labels: topProducts.map((p) => p.productName || "N/A").slice(0, 5),
    datasets: [
      {
        label: "Sản phẩm bán chạy",
        data: topProducts
          .map((p, index) => topProducts.length - index)
          .slice(0, 5), // Placeholder: rank
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopProductsChart;
