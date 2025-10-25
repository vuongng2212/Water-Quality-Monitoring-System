import React from 'react';

const iconColorMap = {
    '🧪': 'bg-blue-100 text-blue-600',
    '🌡️': 'bg-red-100 text-red-600',
    '💧': 'bg-yellow-100 text-yellow-600',
    '⚡': 'bg-green-100 text-green-600',
};

function MetricCard({ data }) {
  const { icon, label, value, unit, standard, updated } = data;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-1">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconColorMap[icon] || 'bg-gray-100'}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}{unit}</p>
          <p className="text-xs text-gray-500">
            {standard ? `Tiêu chuẩn: ${standard}` : `Cập nhật: ${updated}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MetricCard;