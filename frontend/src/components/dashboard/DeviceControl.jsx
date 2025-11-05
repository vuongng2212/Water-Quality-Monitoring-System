import React, { useState, useEffect } from 'react';
import { deviceControlAPI } from '@/utils/api.js';

const ToggleSwitch = ({ label, id, checked, onChange, statusText, loading }) => (
  <div>
    <label className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <label className="relative inline-block w-14 h-8">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={loading}
          className="opacity-0 w-0 h-0"
        />
        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition duration-300 before:content-[''] before:absolute before:h-6 before:w-6 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform before:duration-300 ${checked ? 'before:translate-x-6 bg-green-500' : 'bg-gray-300'} ${loading ? 'cursor-not-allowed opacity-50' : ''}`}></span>
      </label>
    </label>
    <p className="text-xs text-gray-500 mt-1">{statusText}</p>
  </div>
);

function DeviceControl({ devices = [] }) {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [deviceSettings, setDeviceSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load device settings when device is selected
  useEffect(() => {
    if (selectedDevice) {
      loadDeviceSettings(selectedDevice);
    } else {
      setDeviceSettings(null);
    }
  }, [selectedDevice]);

  const loadDeviceSettings = async (deviceId) => {
    try {
      setLoading(true);
      setError('');
      const settings = await deviceControlAPI.getDeviceSettings(deviceId);
      setDeviceSettings(settings);
    } catch (err) {
      console.error('Error loading device settings:', err);
      setError('Không thể tải cài đặt thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleValveControl = async (open) => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      setError('');
      await deviceControlAPI.controlValve(selectedDevice, open);
      // Update local state
      setDeviceSettings(prev => prev ? { ...prev, isValveOpen: open } : null);
    } catch (err) {
      console.error('Error controlling valve:', err);
      setError('Không thể điều khiển van');
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = async (newInterval) => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      setError('');
      await deviceControlAPI.setDataInterval(selectedDevice, parseInt(newInterval));
      // Update local state
      setDeviceSettings(prev => prev ? { ...prev, dataIntervalSeconds: parseInt(newInterval) } : null);
    } catch (err) {
      console.error('Error setting interval:', err);
      setError('Không thể thay đổi khoảng thời gian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Device Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn thiết bị
        </label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Chọn thiết bị...</option>
          {devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      {selectedDevice && deviceSettings && (
        <>
          <ToggleSwitch
            label="Van cấp nước"
            id="valveToggle"
            checked={deviceSettings.isValveOpen || false}
            onChange={(e) => handleValveControl(e.target.checked)}
            statusText={`Trạng thái: ${deviceSettings.isValveOpen ? 'Mở' : 'Đóng'}`}
            loading={loading}
          />

          <ToggleSwitch
            label="Thu thập dữ liệu"
            id="dataToggle"
            checked={deviceSettings.isCollectingData || false}
            onChange={() => { }} // TODO: Implement when backend supports
            statusText={`Trạng thái: ${deviceSettings.isCollectingData ? 'Đang hoạt động' : 'Tạm dừng'}`}
            loading={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian gửi dữ liệu (giây)
            </label>
            <input
              type="range"
              id="intervalSlider"
              min="5"
              max="60"
              value={deviceSettings.dataIntervalSeconds || 15}
              onChange={(e) => handleIntervalChange(e.target.value)}
              disabled={loading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5s</span>
              <span>{deviceSettings.dataIntervalSeconds || 15}s</span>
              <span>60s</span>
            </div>
          </div>
        </>
      )}

      {selectedDevice && !deviceSettings && !loading && (
        <div className="text-center text-gray-500 text-sm py-4">
          Đang tải cài đặt thiết bị...
        </div>
      )}
    </div>
  );
}

export default DeviceControl;