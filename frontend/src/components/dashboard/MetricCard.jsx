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
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconColorMap[icon] || 'bg-gray-100 text-gray-600'}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
          <p className="text-xs text-gray-400 mt-1">
            {standard ? `Tiêu chuẩn: ${standard}` : `Cập nhật: ${updated}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MetricCard;