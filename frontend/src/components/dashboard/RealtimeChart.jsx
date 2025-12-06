import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

// Đăng ký plugins
ChartJS.register(zoomPlugin);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Định nghĩa các ngưỡng validation
const THRESHOLDS = {
  ph: { min: 5.5, max: 9, unit: '' },
  temperature: { min: 0, max: 40, unit: '°C' },
  turbidity: { min: 0, max: 50, unit: 'NTU' },
  tds: { min: 0, max: 1000, unit: 'mg/l' },
};

// Hàm kiểm tra vi phạm ngưỡng
const checkViolation = (field, value) => {
  const threshold = THRESHOLDS[field];
  if (!threshold) return null;
  
  if (value < threshold.min) return 'low';
  if (value > threshold.max) return 'high';
  return null;
};

// Hàm lấy thông tin cảnh báo
const getViolationInfo = (field, violation) => {
  const threshold = THRESHOLDS[field];
  if (!threshold) return null;

  const fieldNames = {
    ph: 'pH',
    temperature: 'Nhiệt độ',
    turbidity: 'Độ đục',
    tds: 'Tổng chất rắn hòa tan',
  };

  if (violation === 'low') {
    return `${fieldNames[field]} dưới ${threshold.min}${threshold.unit}`;
  } else if (violation === 'high') {
    return `${fieldNames[field]} vượt ${threshold.max}${threshold.unit}`;
  }
  return null;
};

function RealtimeChart({ data = [] }) {
  const chartRef = useRef(null);
  
  const [visibleFields, setVisibleFields] = React.useState({
    ph: true,
    temperature: true,
    turbidity: true,
    tds: true,
  });

  const handleFieldToggle = (field) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Tính toán các điểm vi phạm
  const violations = React.useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    const violationList = [];

    safeData.forEach((item, index) => {
      ['ph', 'temperature', 'turbidity', 'tds'].forEach((field) => {
        const value = item[field];
        if (value !== undefined && value !== null) {
          const violation = checkViolation(field, value);
          if (violation) {
            violationList.push({
              index,
              field,
              value,
              violation,
              timestamp: item.timestamp,
              message: getViolationInfo(field, violation),
            });
          }
        }
      });
    });

    return violationList;
  }, [data]);

  // Chuẩn bị dữ liệu biểu đồ
  const chartData = React.useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];

    if (!safeData || safeData.length === 0) {
      return {
        datasets: []
      };
    }

    const recentData = safeData.slice(-20);
    const datasets = [];

    if (visibleFields.ph) {
      datasets.push({
        label: 'pH',
        data: recentData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.ph
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        yAxisID: 'y',
        segment: {
          borderColor: ctx => {
            const dataPoint = recentData[ctx.p0DataIndex];
            if (dataPoint) {
              const violation = checkViolation('ph', dataPoint.ph);
              return violation ? 'rgb(255, 0, 0)' : 'rgb(59, 130, 246)';
            }
            return 'rgb(59, 130, 246)';
          },
        },
        pointRadius: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('ph', dataPoint.ph);
            return violation ? 8 : 4;
          }
          return 4;
        },
        pointBackgroundColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('ph', dataPoint.ph);
            if (violation === 'low') return 'rgb(59, 130, 246)';
            if (violation === 'high') return 'rgb(255, 0, 0)';
          }
          return 'rgb(59, 130, 246)';
        },
        pointBorderColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('ph', dataPoint.ph);
            return violation ? 'rgb(255, 255, 255)' : 'rgb(59, 130, 246)';
          }
          return 'rgb(59, 130, 246)';
        },
        pointBorderWidth: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('ph', dataPoint.ph);
            return violation ? 3 : 1;
          }
          return 1;
        },
      });

      
    }

    if (visibleFields.temperature) {
      datasets.push({
        label: 'Nhiệt độ (°C)',
        data: recentData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.temperature
        })),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
        pointRadius: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('temperature', dataPoint.temperature);
            return violation ? 8 : 4;
          }
          return 4;
        },
        pointBackgroundColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('temperature', dataPoint.temperature);
            return violation ? 'rgb(255, 0, 0)' : 'rgb(239, 68, 68)';
          }
          return 'rgb(239, 68, 68)';
        },
        pointBorderColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('temperature', dataPoint.temperature);
            return violation ? 'rgb(255, 255, 255)' : 'rgb(239, 68, 68)';
          }
          return 'rgb(239, 68, 68)';
        },
        pointBorderWidth: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('temperature', dataPoint.temperature);
            return violation ? 3 : 1;
          }
          return 1;
        },
      });
    }

    if (visibleFields.turbidity) {
      datasets.push({
        label: 'Độ đục (NTU)',
        data: recentData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.turbidity
        })),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        yAxisID: 'y2',
        pointRadius: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('turbidity', dataPoint.turbidity);
            return violation ? 8 : 4;
          }
          return 4;
        },
        pointBackgroundColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('turbidity', dataPoint.turbidity);
            return violation ? 'rgb(255, 0, 0)' : 'rgb(245, 158, 11)';
          }
          return 'rgb(245, 158, 11)';
        },
        pointBorderColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('turbidity', dataPoint.turbidity);
            return violation ? 'rgb(255, 255, 255)' : 'rgb(245, 158, 11)';
          }
          return 'rgb(245, 158, 11)';
        },
        pointBorderWidth: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('turbidity', dataPoint.turbidity);
            return violation ? 3 : 1;
          }
          return 1;
        },
      });
    }

    if (visibleFields.tds) {
      datasets.push({
        label: 'Tổng chất rắn hòa tan (mg/l)',
        data: recentData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.tds
        })),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
        yAxisID: 'y3',
        pointRadius: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('tds', dataPoint.tds);
            return violation ? 8 : 4;
          }
          return 4;
        },
        pointBackgroundColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('tds', dataPoint.tds);
            return violation ? 'rgb(255, 0, 0)' : 'rgb(34, 197, 94)';
          }
          return 'rgb(34, 197, 94)';
        },
        pointBorderColor: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('tds', dataPoint.tds);
            return violation ? 'rgb(255, 255, 255)' : 'rgb(34, 197, 94)';
          }
          return 'rgb(34, 197, 94)';
        },
        pointBorderWidth: ctx => {
          const dataPoint = recentData[ctx.dataIndex];
          if (dataPoint) {
            const violation = checkViolation('tds', dataPoint.tds);
            return violation ? 3 : 1;
          }
          return 1;
        },
      });
    }

    return { datasets };
  }, [data, visibleFields]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'dd/MM HH:mm',
            hour: 'dd/MM HH:mm',
            day: 'dd/MM',
          },
          tooltipFormat: 'dd/MM/yyyy HH:mm:ss',
        },
        title: {
          display: true,
          text: 'Thời gian'
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'pH (5.5 - 9)',
          color: 'rgb(59, 130, 246)',
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
          text: 'Nhiệt độ (°C) (≤ 40)',
          color: 'rgb(239, 68, 68)',
        },
        min: 0,
        max: 60,
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
          text: 'Độ đục (NTU) (≤ 50)',
          color: 'rgb(245, 158, 11)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
      y3: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'TDS (mg/l) (≤ 1000)',
          color: 'rgb(34, 197, 94)',
        },
        min: 0,
        max: 1500,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        onClick: null, // Vô hiệu hóa click để ẩn/hiện dataset
      },
      title: {
        display: true,
        text: 'Dữ liệu cảm biến thời gian thực - Các điểm đỏ lớn biểu thị vi phạm ngưỡng',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
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
            const dataPoint = context.raw;

            // Bỏ qua các đường ngưỡng trong tooltip
            if (dataset.label.includes('Ngưỡng')) {
              return null;
            }

            let label = dataset.label || '';
            let unit = '';

            if (label.includes('pH')) {
              unit = '';
              label = 'pH';
            } else if (label.includes('Nhiệt độ')) {
              unit = '°C';
              label = 'Nhiệt độ';
            } else if (label.includes('Độ đục')) {
              unit = 'NTU';
              label = 'Độ đục';
            } else if (label.includes('Tổng chất rắn hòa tan')) {
              unit = 'mg/l';
              label = 'Tổng chất rắn hòa tan';
            }

            const field = Object.keys(THRESHOLDS).find(
              k => label.toLowerCase().includes(k) || 
                   (k === 'tds' && label.includes('Tổng chất rắn hòa tan'))
            );

            let violation = '';
            if (field) {
              const vio = checkViolation(field, value);
              if (vio) {
                violation = ' ⚠️ VI PHẠM NGƯỠNG';
              }
            }

            return `${label}: ${value}${unit}${violation}`;
          },
          footer: function (context) {
            let footerText = '';
            context.forEach((item) => {
              const dataset = item.dataset;
              if (!dataset.label.includes('Ngưỡng')) {
                const field = Object.keys(THRESHOLDS).find(k => dataset.label.includes(k) || (k === 'tds' && dataset.label.includes('Tổng chất')));
                if (field) {
                  const threshold = THRESHOLDS[field];
                  footerText += `Ngưỡng ${dataset.label.split('(')[0].trim()}: ${threshold.min}-${threshold.max} ${threshold.unit}\n`;
                }
              }
            });
            return footerText;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
          drag: {
            enabled: true,
            backgroundColor: 'rgba(54, 162, 235, 0.3)',
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 1,
          },
        },
        limits: {
          x: {
            minDelay: 1000 * 60 * 5,
            maxDelay: 1000 * 60 * 60 * 24,
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

  // Lọc các vi phạm gần đây
  const recentViolations = violations.slice(-10);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={visibleFields.ph} 
            onChange={() => handleFieldToggle('ph')}
            className="w-4 h-4"
          />
          <span className="text-sm">pH</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={visibleFields.temperature} 
            onChange={() => handleFieldToggle('temperature')}
            className="w-4 h-4"
          />
          <span className="text-sm">Nhiệt độ (°C)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={visibleFields.turbidity} 
            onChange={() => handleFieldToggle('turbidity')}
            className="w-4 h-4"
          />
          <span className="text-sm">Độ đục (NTU)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={visibleFields.tds} 
            onChange={() => handleFieldToggle('tds')}
            className="w-4 h-4"
          />
          <span className="text-sm">Tổng chất rắn hòa tan (mg/l)</span>
        </label>
        <button
          onClick={() => {
            if (chartRef.current) {
              chartRef.current.resetZoom();
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors"
        >
          Reset Zoom
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <Line ref={chartRef} options={options} data={chartData} />
      </div>
    </div>
  );
}

export default RealtimeChart;