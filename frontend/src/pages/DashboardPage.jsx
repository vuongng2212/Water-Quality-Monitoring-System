import React from 'react';
import ViewControls from '../components/dashboard/ViewControls';
import AlertBanner from '../components/dashboard/AlertBanner';
import MetricCard from '../components/dashboard/MetricCard';
import RealtimeChart from '../components/dashboard/RealtimeChart';
import DeviceControl from '../components/dashboard/DeviceControl';
import LatestDataTable from '../components/dashboard/LatestDataTable';

function DashboardPage() {
  // Mock data for now, will be replaced with real data from contexts/services
  const metrics = {
    ph: { value: 7.2, label: 'pH', unit: '', standard: '6.0-9.0', icon: '🧪' },
    temperature: { value: 25.3, label: 'Nhiệt độ', unit: '°C', standard: '20-30°C', icon: '🌡️' },
    turbidity: { value: 2.1, label: 'Độ đục', unit: 'NTU', updated: '10:30', icon: '💧' },
    conductivity: { value: 450, label: 'Độ dẫn điện', unit: 'µS/cm', updated: '10:30', icon: '⚡' },
  };

  return (
    <div>
      <ViewControls />
      <AlertBanner />

      <h2 id="dashboard-title" className="text-2xl font-bold text-gray-800 mb-4">Dashboard Tổng quan</h2>
      
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard data={metrics.ph} />
        <MetricCard data={metrics.temperature} />
        <MetricCard data={metrics.turbidity} />
        <MetricCard data={metrics.conductivity} />
      </div>

      {/* Charts and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ thời gian thực</h3>
          <RealtimeChart />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khiển thiết bị</h3>
            <DeviceControl />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Dữ liệu mới nhất</h3>
        </div>
        <LatestDataTable />
      </div>
    </div>
  );
}

export default DashboardPage;