import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RealtimeChart() {
  // Mock data for now
  const data = {
    labels: ['10:30:00', '10:30:15', '10:30:30', '10:30:45', '10:31:00'],
    datasets: [
      {
        label: 'pH',
        data: [7.2, 7.1, 7.3, 7.2, 7.4],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
      {
        label: 'Nhiệt độ (°C)',
        data: [25.3, 25.4, 25.3, 25.5, 25.4],
        borderColor: 'rgb(239, 68, 68)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
        y: {
            beginAtZero: false
        }
    }
  };

  return <Line options={options} data={data} />;
}

export default RealtimeChart;