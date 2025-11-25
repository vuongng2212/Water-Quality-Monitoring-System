import React, { useState, useEffect, useCallback } from 'react';
import { sensorDataAPI, deviceAPI } from '@/utils/api.js';
import RealtimeChart from '../components/dashboard/RealtimeChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { theme } from '../utils/theme';

function HistoryPage() {
  const [devices, setDevices] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [selectedDevice, setSelectedDevice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(100);

  // Load devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devicesData = await deviceAPI.getDevices();
        setDevices(devicesData);
      } catch (err) {
        console.error('Error loading devices:', err);
      }
    };
    loadDevices();
  }, []);

  const fetchHistoricalData = useCallback(async () => {
    if (!selectedDevice) {
      setHistoricalData([]);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await sensorDataAPI.getHistory(
        selectedDevice,
        startDate || null,
        endDate || null,
        limit
      );

      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Không thể tải dữ liệu lịch sử');
    } finally {
      setLoading(false);
    }
  }, [selectedDevice, startDate, endDate, limit]);

  // Load historical data when filters change
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={`${theme.spacing.page} ${theme.spacing.section}`}>
      <div className="mb-8">
        <h1 className={`${theme.typography.h1} mb-2`}>Lịch sử dữ liệu</h1>
        <p className={`${theme.typography.body} text-gray-600`}>
          Xem và phân tích dữ liệu lịch sử chất lượng nước
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Header>
          <h2 className={theme.typography.h2}>Bộ lọc dữ liệu</h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thiết bị
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Chọn thiết bị...</option>
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng bản ghi
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="text-red-700">{error}</div>
        </Card>
      )}

      {/* Chart */}
      {selectedDevice && (
        <Card className="mb-6">
          <Card.Header>
            <h2 className={theme.typography.h2}>
              Biểu đồ dữ liệu lịch sử - {devices.find(d => d.id.toString() === selectedDevice)?.name}
            </h2>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <RealtimeChart data={historicalData} />
            )}
          </Card.Content>
        </Card>
      )}

      {/* Data Table */}
      {selectedDevice && (
        <Card>
          <Card.Header>
            <h2 className={theme.typography.h2}>
              Dữ liệu lịch sử - {devices.find(d => d.id.toString() === selectedDevice)?.name}
            </h2>
          </Card.Header>
          <Card.Content className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        pH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhiệt độ (°C)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Độ đục (NTU)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Độ dẫn điện (µS/cm)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          {selectedDevice ? 'Không có dữ liệu trong khoảng thời gian này' : 'Vui lòng chọn thiết bị'}
                        </td>
                      </tr>
                    ) : (
                      historicalData.map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateForDisplay(row.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.ph || '--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.temperature || '--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.turbidity || '--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.conductivity || '--'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      {!selectedDevice && (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 text-lg">Vui lòng chọn thiết bị để xem dữ liệu lịch sử</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default HistoryPage;