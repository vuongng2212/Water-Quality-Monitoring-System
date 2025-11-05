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

function RealtimeChart({ data = [] }) {
  // Prepare chart data from sensor data
  const chartData = React.useMemo(() => {
    // Ensure data is an array
    const safeData = Array.isArray(data) ? data : [];

    if (!safeData || safeData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Take last 20 data points for the chart
    const recentData = safeData.slice(-20).reverse();

    const labels = recentData.map(item =>
      new Date(item.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );

    return {
      labels,
      datasets: [
        {
          label: 'pH',
          data: recentData.map(item => item.ph),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'Nhiệt độ (°C)',
          data: recentData.map(item => item.temperature),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          yAxisID: 'y1',
        },
        {
          label: 'Độ đục (NTU)',
          data: recentData.map(item => item.turbidity),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.1,
          yAxisID: 'y2',
        },
        {
          label: 'Độ dẫn điện (µS/cm)',
          data: recentData.map(item => item.conductivity),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
          yAxisID: 'y3',
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'pH'
        },
        min: 0,
        max: 14,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Nhiệt độ (°C)'
        },
        min: 0,
        max: 50,
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Độ đục (NTU)'
        },
        min: 0,
        max: 10,
        grid: {
          drawOnChartArea: false,
        },
      },
      y3: {
        type: 'linear',
        display: false, // Hide this axis, show in tooltip only
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dữ liệu cảm biến thời gian thực',
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Chưa có dữ liệu để hiển thị biểu đồ
      </div>
    );
  }

  return <Line options={options} data={chartData} />;
}

export default RealtimeChart;