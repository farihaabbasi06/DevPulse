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

function ContributionChart({ contributions }) {

  const data = {
    labels: Object.keys(contributions),

    datasets: [
      {
        label: "Contributions",
        data: Object.values(contributions)
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-8 w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">
        Contribution Activity
      </h2>

      <Bar data={data} />
    </div>
  );
}

export default ContributionChart;