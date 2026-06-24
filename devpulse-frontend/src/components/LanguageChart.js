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

function LanguageChart({ languages }) {

  const data = {
    labels: Object.keys(languages),

    datasets: [
      {
        label: "Languages",
        data: Object.values(languages)
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <Bar data={data} />
    </div>
  );
}

export default LanguageChart;