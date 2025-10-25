import React, { useState } from 'react';

const ToggleSwitch = ({ label, id, checked, onChange, statusText }) => (
    <div>
        <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <label className="relative inline-block w-14 h-8">
                <input type="checkbox" id={id} checked={checked} onChange={onChange} className="opacity-0 w-0 h-0" />
                <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition duration-300 before:content-[''] before:absolute before:h-6 before:w-6 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform before:duration-300 peer-checked:before:translate-x-6 peer-checked:bg-green-500"></span>
            </label>
        </label>
        <p className="text-xs text-gray-500 mt-1">{statusText}</p>
    </div>
);


function DeviceControl() {
  const [valveOpen, setValveOpen] = useState(false);
  const [collectingData, setCollectingData] = useState(true);
  const [interval, setIntervalValue] = useState(15);

  return (
    <div className="space-y-6">
        <ToggleSwitch 
            label="Van cấp nước"
            id="valveToggle"
            checked={valveOpen}
            onChange={() => setValveOpen(!valveOpen)}
            statusText={`Trạng thái: ${valveOpen ? 'Mở' : 'Đóng'}`}
        />
        <ToggleSwitch 
            label="Thu thập dữ liệu"
            id="dataToggle"
            checked={collectingData}
            onChange={() => setCollectingData(!collectingData)}
            statusText={`Trạng thái: ${collectingData ? 'Đang hoạt động' : 'Tạm dừng'}`}
        />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian gửi dữ liệu (giây)</label>
        <input 
            type="range" 
            id="intervalSlider" 
            min="5" 
            max="60" 
            value={interval}
            onChange={(e) => setIntervalValue(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5s</span>
          <span>{interval}s</span>
          <span>60s</span>
        </div>
      </div>
    </div>
  );
}

export default DeviceControl;