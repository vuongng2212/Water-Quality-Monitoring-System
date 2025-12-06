import React from 'react';

function LatestDataTable({ data = [] }) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhiệt độ (°C)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Độ đục (NTU)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng chất rắn hòa tan (mg/l)</th>
          </tr>
        </thead>
        <tbody id="dataTableBody" className="bg-white divide-y divide-gray-200">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            safeData.map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ph || '--'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.temperature || '--'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.turbidity || '--'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.tds || '--'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LatestDataTable;