import React from 'react';

function LatestDataTable() {
  // Mock data for now
  const data = [
    { time: '10:31:00', ph: 7.4, temp: 25.4, turbidity: 2.2, conductivity: 455 },
    { time: '10:30:45', ph: 7.2, temp: 25.5, turbidity: 2.1, conductivity: 452 },
    { time: '10:30:30', ph: 7.3, temp: 25.3, turbidity: 2.3, conductivity: 458 },
    { time: '10:30:15', ph: 7.1, temp: 25.4, turbidity: 2.0, conductivity: 451 },
    { time: '10:30:00', ph: 7.2, temp: 25.3, turbidity: 2.1, conductivity: 450 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhiệt độ (°C)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Độ đục (NTU)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Độ dẫn điện (µS/cm)</th>
          </tr>
        </thead>
        <tbody id="dataTableBody" className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.time}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ph}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.temp}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.turbidity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.conductivity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LatestDataTable;