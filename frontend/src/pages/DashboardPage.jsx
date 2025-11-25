import React, { useState, useEffect } from 'react';
import AlertBanner from '../components/dashboard/AlertBanner';
import MetricCard from '../components/dashboard/MetricCard';
import RealtimeChart from '../components/dashboard/RealtimeChart';
import DeviceControl from '../components/dashboard/DeviceControl';
import LatestDataTable from '../components/dashboard/LatestDataTable';
import Card from '../components/ui/Card';
import { sensorDataAPI, deviceAPI } from '@/utils/api.js';
import { theme } from '../utils/theme';

function DashboardPage() {
  const [metrics, setMetrics] = useState({
    ph: { value: null, label: 'pH', unit: '', standard: '6.5-8.5', icon: '🧪' },
    temperature: { value: null, label: 'Nhiệt độ', unit: '°C', standard: '≤30°C', icon: '🌡️' },
    turbidity: { value: null, label: 'Độ đục', unit: 'NTU', standard: '≤5 NTU', icon: '💧' },
    conductivity: { value: null, label: 'Độ dẫn điện', unit: 'µS/cm', standard: '≤1000 µS/cm', icon: '⚡' },
  });
  const [devices, setDevices] = useState([]);
  // Lưu lịch sử 20 bản ghi realtime
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstDeviceId, setFirstDeviceId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      } catch (error) {
        if (error.response?.status === 403) {
          setError('Bạn không có quyền truy cập dữ liệu này. Vui lòng liên hệ quản trị viên.');
        } else if (error.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        }
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
      setSyncing(true);
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
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('[POLL] Lỗi khi polling:', error);
        setError('Lỗi đồng bộ dữ liệu. Đang thử lại...');
      } finally {
        setSyncing(false);
      }
    };
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [firstDeviceId]);



  return (
    <div className={`${theme.spacing.page} ${theme.spacing.section}`}>
      <AlertBanner metrics={metrics} />

      <div className="mb-8">
        <h1 className={`${theme.typography.h1} mb-2`}>Dashboard Tổng quan</h1>
        <p className={`${theme.typography.body} text-gray-600`}>
          Giám sát chất lượng nước thời gian thực
        </p>
      </div>

      {/* Sync Status */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
              {isOnline ? '🟢' : '🔴'} {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {syncing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              <span className="text-gray-600">Đang đồng bộ...</span>
            </div>
          ) : (
            <span className="text-green-600">✅ Đồng bộ thành công</span>
          )}
          {lastSyncTime && (
            <span className="text-gray-500">Lần cuối: {lastSyncTime}</span>
          )}
        </div>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex justify-between items-center">
            <span className="text-red-700">{error}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Real-time Metrics */}
          <div className="mb-8">
            <h2 className={`${theme.typography.h2} mb-6`}>Chỉ số thời gian thực</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard data={metrics.ph} />
              <MetricCard data={metrics.temperature} />
              <MetricCard data={metrics.turbidity} />
              <MetricCard data={metrics.conductivity} />
            </div>
          </div>

          {/* Charts and Controls */}
          <div className="mb-8">
            <h2 className={`${theme.typography.h2} mb-6`}>Điều khiển & Giám sát</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <Card.Header>
                  <h3 className={theme.typography.h3}>Điều khiển thiết bị</h3>
                </Card.Header>
                <Card.Content>
                  <DeviceControl devices={devices} />
                </Card.Content>
              </Card>
              <Card className="lg:col-span-2">
                <Card.Header>
                  <h3 className={theme.typography.h3}>Biểu đồ thời gian thực</h3>
                </Card.Header>
                <Card.Content>
                  {historyData && historyData.length > 0 ? (
                    <RealtimeChart data={historyData} />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu để hiển thị biểu đồ'}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          </div>

          {/* Data Table */}
          <Card>
            <Card.Header>
              <h2 className={theme.typography.h2}>Dữ liệu mới nhất</h2>
            </Card.Header>
            <Card.Content>
              {historyData && historyData.length > 0 ? (
                <LatestDataTable data={historyData} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu để hiển thị'}
                </div>
              )}
            </Card.Content>
          </Card>
        </>
      )}
    </div>
  );
}

export default DashboardPage;