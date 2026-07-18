import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function ContributionChart({ contributions, theme }) {
  const isDark = theme === "dark";

  const data = {
    labels: Object.keys(contributions || {}),
    datasets: [
      {
        label: "Contributions",
        data: Object.values(contributions || {}),
        backgroundColor: isDark ? "rgba(236, 72, 153, 0.65)" : "rgba(219, 39, 119, 0.65)",
        borderColor: isDark ? "#f43f5e" : "#db2777",
        borderWidth: 1.5,
        borderRadius: 8, // rounded bars
        borderSkipped: false,
        hoverBackgroundColor: isDark ? "rgba(236, 72, 153, 0.85)" : "rgba(219, 39, 119, 0.85)",
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide duplicate legend label since header covers it
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(18, 19, 28, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "#ffffff" : "#1e293b",
        bodyColor: isDark ? "#f43f5e" : "#db2777",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(219, 39, 119, 0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: {
          family: "system-ui, sans-serif",
          weight: "bold",
          size: 13
        },
        bodyFont: {
          family: "system-ui, sans-serif",
          weight: "600",
          size: 12
        },
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // clean vertical spacing
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: {
            family: "system-ui, sans-serif",
            weight: "600",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(219, 39, 119, 0.04)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: {
            family: "system-ui, sans-serif",
            weight: "600",
            size: 11
          },
          precision: 0
        }
      }
    }
  };

  return (
    <div className="w-full h-64 relative mt-2">
      <Bar data={data} options={options} />
    </div>
  );
}

export default ContributionChart;


