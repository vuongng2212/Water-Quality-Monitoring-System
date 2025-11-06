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
  // Lưu lịch sử 20 bản ghi realtime
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstDeviceId, setFirstDeviceId] = useState(null);

  // Lấy danh sách thiết bị và 20 bản ghi đầu tiên khi mount
  useEffect(() => {
    const init = async () => {
      setError(null);
      setLoading(true);
      try {
        const devicesData = await deviceAPI.getDevices();
        setDevices(devicesData);
        if (devicesData.length > 0) {
          setFirstDeviceId(devicesData[0].id);
          // Lấy 20 bản ghi mới nhất
          const sensorDataResponse = await sensorDataAPI.getHistory(devicesData[0].id, null, null, 20);
          let sensorData = sensorDataResponse.content || sensorDataResponse;
          // Sắp xếp tăng dần theo timestamp nếu cần
          sensorData = sensorData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setHistoryData(sensorData);
          // Cập nhật metrics từ bản ghi mới nhất
          if (sensorData.length > 0) {
            const latest = sensorData[sensorData.length - 1];
            setMetrics(prev => ({
              ...prev,
              ph: { ...prev.ph, value: latest.ph ?? 'N/A' },
              temperature: { ...prev.temperature, value: latest.temperature ?? 'N/A' },
              turbidity: { ...prev.turbidity, value: latest.turbidity ?? 'N/A', updated: latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'N/A' },
              conductivity: { ...prev.conductivity, value: latest.conductivity ?? 'N/A', updated: latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'N/A' },
            }));
          }
        }
      } catch {
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Polling: mỗi 10s lấy 1 bản ghi mới nhất, nếu mới hơn thì thêm vào historyData
  useEffect(() => {
    if (!firstDeviceId) return;
    const poll = async () => {
      try {
        console.log('[POLL] Bắt đầu polling cho device:', firstDeviceId);
        const sensorDataResponse = await sensorDataAPI.getHistory(firstDeviceId, null, null, 1);
        let sensorData = sensorDataResponse.content || sensorDataResponse;
        console.log('[POLL] API response:', sensorDataResponse);
        console.log('[POLL] Extracted sensorData:', sensorData);

        if (sensorData && sensorData.length > 0) {
          console.log('[POLL] First record (newest):', sensorData[0]?.timestamp, 'ID:', sensorData[0]?.id);
          console.log('[POLL] Last record (oldest):', sensorData[sensorData.length - 1]?.timestamp, 'ID:', sensorData[sensorData.length - 1]?.id);

          // Vì API sort DESC theo timestamp, bản ghi đầu tiên là mới nhất
          const latest = sensorData[0];
          console.log('[POLL] Latest record from API (first in sorted DESC):', latest);
          setHistoryData(prev => {
            if (prev.length === 0) {
              console.log('[POLL] history empty, push:', latest.timestamp);
              return [latest];
            }
            const last = prev[prev.length - 1];
            console.log('[POLL] last timestamp:', last.timestamp, '| latest:', latest.timestamp);
            // Nếu bản ghi mới hơn thì thêm vào
            if (new Date(latest.timestamp) > new Date(last.timestamp)) {
              console.log('[POLL] Thêm bản ghi mới vào historyData');
              const next = [...prev, latest];
              // Giữ tối đa 20 bản ghi
              return next.slice(-20);
            } else {
              console.log('[POLL] Không có bản ghi mới, không thêm');
            }
            return prev;
          });
          // Cập nhật metrics
          setMetrics(prev => ({
            ...prev,
            ph: { ...prev.ph, value: latest.ph ?? 'N/A' },
            temperature: { ...prev.temperature, value: latest.temperature ?? 'N/A' },
            turbidity: { ...prev.turbidity, value: latest.turbidity ?? 'N/A', updated: latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'N/A' },
            conductivity: { ...prev.conductivity, value: latest.conductivity ?? 'N/A', updated: latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'N/A' },
          }));
          console.log('[POLL] Đã cập nhật metrics với dữ liệu mới');
        } else {
          console.log('[POLL] Không có dữ liệu trong response');
        }
      } catch (error) {
        console.error('[POLL] Lỗi khi polling:', error);
      }
    };
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [firstDeviceId]);



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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khiển thiết bị</h3>
              <DeviceControl devices={devices} />
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ thời gian thực</h3>
              {historyData && historyData.length > 0 ? (
                <RealtimeChart data={historyData} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu để hiển thị biểu đồ'}
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Dữ liệu mới nhất</h3>
            </div>
            {historyData && historyData.length > 0 ? (
              <LatestDataTable data={historyData} />
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