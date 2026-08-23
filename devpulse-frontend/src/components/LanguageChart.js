
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function LanguageChart({ languages, theme }) {
  const isDark = theme === "dark";
  const values = Object.values(languages || {});
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  // 20% headroom above the tallest bar so nothing touches the chart ceiling
  const suggestedMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 4;

  const data = {
    labels: Object.keys(languages || {}),
    datasets: [
      {
        label: "Languages",
        data: values,
        backgroundColor: isDark ? "rgba(99, 102, 241, 0.55)" : "rgba(79, 70, 229, 0.55)",
        borderColor: isDark ? "#6366f1" : "#4f46e5",
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
        hoverBackgroundColor: isDark ? "rgba(99, 102, 241, 0.8)" : "rgba(79, 70, 229, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 8 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "rgba(18, 19, 28, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "#ffffff" : "#1e293b",
        bodyColor: isDark ? "#818cf8" : "#4f46e5",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(79, 70, 229, 0.1)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "system-ui, sans-serif", weight: "600", size: 12 },
        bodyFont: { family: "system-ui, sans-serif", weight: "500", size: 11 },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { family: "system-ui, sans-serif", weight: "500", size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax,
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(79, 70, 229, 0.04)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { family: "system-ui, sans-serif", weight: "500", size: 10 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="w-full h-56 relative">
      <Bar data={data} options={options} />
    </div>
  );
}

export default LanguageChart;