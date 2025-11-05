import React, { useState, useEffect } from 'react';
import ViewControls from '../components/dashboard/ViewControls';
import AlertBanner from '../components/dashboard/AlertBanner';
import MetricCard from '../components/dashboard/MetricCard';
import RealtimeChart from '../components/dashboard/RealtimeChart';
import DeviceControl from '../components/dashboard/DeviceControl';
import LatestDataTable from '../components/dashboard/LatestDataTable';
import { sensorDataAPI, deviceAPI } from '@/utils/api.js';

function DashboardPage() {
  const [metrics, setMetrics] = useState({
    ph: { value: null, label: 'pH', unit: '', standard: '6.0-9.0', icon: '🧪' },
    temperature: { value: null, label: 'Nhiệt độ', unit: '°C', standard: '20-30°C', icon: '🌡️' },
    turbidity: { value: null, label: 'Độ đục', unit: 'NTU', updated: null, icon: '💧' },
    conductivity: { value: null, label: 'Độ dẫn điện', unit: 'µS/cm', updated: null, icon: '⚡' },
  });
  const [devices, setDevices] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch devices list first
      const devicesData = await deviceAPI.getDevices();
      setDevices(devicesData);

      // Fetch latest sensor data for metrics - get from first available device
      if (devicesData.length > 0) {
        const firstDevice = devicesData[0];
        try {
          const sensorDataResponse = await sensorDataAPI.getHistory(firstDevice.id, null, null, 1);
          // Handle Page response format from Spring Boot
          const sensorData = sensorDataResponse.content || sensorDataResponse;
          if (sensorData && sensorData.length > 0) {
            const latest = sensorData[0]; // Get the most recent data
            setMetrics(prev => ({
              ...prev,
              ph: { ...prev.ph, value: latest.ph },
              temperature: { ...prev.temperature, value: latest.temperature },
              turbidity: { ...prev.turbidity, value: latest.turbidity, updated: new Date(latest.timestamp).toLocaleTimeString() },
              conductivity: { ...prev.conductivity, value: latest.conductivity, updated: new Date(latest.timestamp).toLocaleTimeString() },
            }));
            // Also set latest data for table
            setLatestData(sensorData);
          }
        } catch (err) {
          console.warn('Could not fetch sensor data for device:', firstDevice.id, err);
          // Continue without sensor data
        }
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and polling for real-time updates
  useEffect(() => {
    fetchDashboardData();

    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <ViewControls />
      <AlertBanner metrics={metrics} />

      <h2 id="dashboard-title" className="text-2xl font-bold text-gray-800 mb-4">Dashboard Tổng quan</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
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
              {latestData && latestData.length > 0 ? (
                <RealtimeChart data={latestData} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu để hiển thị biểu đồ'}
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khiển thiết bị</h3>
              <DeviceControl devices={devices} />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Dữ liệu mới nhất</h3>
            </div>
            {latestData && latestData.length > 0 ? (
              <LatestDataTable data={latestData} />
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu để hiển thị'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;