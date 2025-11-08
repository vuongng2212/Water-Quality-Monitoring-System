import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
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

// Đăng ký plugins
ChartJS.register(annotationPlugin, zoomPlugin);

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
  const chartRef = useRef(null);
  // State để kiểm soát hiển thị từng trường dữ liệu
  const [visibleFields, setVisibleFields] = React.useState({
    ph: true,
    temperature: true,
    turbidity: true,
    conductivity: true,
  });

  const handleFieldToggle = (field) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  // Prepare chart data from sensor data
  const chartData = React.useMemo(() => {
    // Ensure data is an array
    const safeData = Array.isArray(data) ? data : [];

    console.log('[REALTIME_CHART] Preparing chart data, input data length:', safeData.length);
    console.log('[REALTIME_CHART] Visible fields:', visibleFields);

    if (!safeData || safeData.length === 0) {
      console.log('[REALTIME_CHART] No data available for chart');
      return {
        labels: [],
        datasets: []
      };
    }

    // Take last 20 data points for the chart (oldest first for left to right, newest on right)
    const recentData = safeData.slice(-20);

    const labels = recentData.map(item =>
      new Date(item.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );

    const datasets = [];
    if (visibleFields.ph) {
      datasets.push({
        label: 'pH',
        data: recentData.map(item => item.ph),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        yAxisID: 'y',
      });
    }
    if (visibleFields.temperature) {
      datasets.push({
        label: 'Nhiệt độ (°C)',
        data: recentData.map(item => item.temperature),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
      });
    }
    if (visibleFields.turbidity) {
      datasets.push({
        label: 'Độ đục (NTU)',
        data: recentData.map(item => item.turbidity),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        yAxisID: 'y2',
      });
    }
    if (visibleFields.conductivity) {
      datasets.push({
        label: 'Độ dẫn điện (µS/cm)',
        data: recentData.map(item => item.conductivity),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
        yAxisID: 'y3',
      });
    }
    return {
      labels,
      datasets,
    };
  }, [data, visibleFields]);

  console.log('[REALTIME_CHART] Chart data prepared:', chartData);

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
      annotation: {
        annotations: {
          phLow: {
            type: 'line',
            yMin: 6,
            yMax: 6,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Cảnh báo pH thấp (<6)',
              position: 'start',
              backgroundColor: 'rgba(255,99,132,0.2)',
              color: 'rgba(255, 99, 132, 1)',
            },
          },
          phHigh: {
            type: 'line',
            yMin: 9,
            yMax: 9,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Cảnh báo pH cao (>9)',
              position: 'start',
              backgroundColor: 'rgba(255,99,132,0.2)',
              color: 'rgba(255, 99, 132, 1)',
            },
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function (context) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          },
          label: function (context) {
            const dataset = context.dataset;
            const value = context.parsed.y;
            const isLatest = context.dataIndex === context.dataset.data.length - 1;

            let label = dataset.label || '';
            let unit = '';

            // Thêm đơn vị phù hợp
            if (label.includes('pH')) {
              unit = '';
              label = 'pH';
            } else if (label.includes('Nhiệt độ')) {
              unit = '°C';
              label = 'Nhiệt độ';
            } else if (label.includes('Độ đục')) {
              unit = 'NTU';
              label = 'Độ đục';
            } else if (label.includes('Độ dẫn điện')) {
              unit = 'µS/cm';
              label = 'Độ dẫn điện';
            }

            // Làm nổi bật giá trị mới nhất
            const highlight = isLatest ? ' ⭐ MỚI NHẤT' : '';

            return `${label}: ${value}${unit}${highlight}`;
          },
          afterBody: function (context) {
            // Thêm thông tin bổ sung nếu cần
            const dataIndex = context[0].dataIndex;
            const totalPoints = context[0].dataset.data.length;
            return `\nĐiểm ${dataIndex + 1}/${totalPoints} trong chuỗi dữ liệu`;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl', // Giữ Ctrl để pan
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x', // Chỉ zoom theo trục X (thời gian)
          drag: {
            enabled: true,
            backgroundColor: 'rgba(54, 162, 235, 0.3)',
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 1,
          },
        },
        limits: {
          x: {
            minDelay: 1000 * 60 * 5, // Tối thiểu 5 phút
            maxDelay: 1000 * 60 * 60 * 24, // Tối đa 24 giờ
          }
        }
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

  // UI cho tuỳ chọn ẩn/hiện trường dữ liệu
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-2">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={visibleFields.ph} onChange={() => handleFieldToggle('ph')} />
          pH
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={visibleFields.temperature} onChange={() => handleFieldToggle('temperature')} />
          Nhiệt độ (°C)
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={visibleFields.turbidity} onChange={() => handleFieldToggle('turbidity')} />
          Độ đục (NTU)
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={visibleFields.conductivity} onChange={() => handleFieldToggle('conductivity')} />
          Độ dẫn điện (µS/cm)
        </label>
        <button
          onClick={() => {
            if (chartRef.current) {
              chartRef.current.resetZoom();
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Reset Zoom
        </button>
      </div>
      <Line ref={chartRef} options={options} data={chartData} />
    </div>
  );
}

export default RealtimeChart;