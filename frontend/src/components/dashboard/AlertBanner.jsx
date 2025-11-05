import React, { useState } from 'react';

function AlertBanner() {
  const [visible, setVisible] = useState(false); // Example state
  const [message, setMessage] = useState('Cảnh báo: pH vượt ngưỡng an toàn!');

  if (!visible) {
    return null;
  }

  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-md animate-pulse">
      <div className="flex items-center">
        <span className="text-xl mr-2">⚠️</span>
        <span className="font-medium">{message}</span>
        <button onClick={() => setVisible(false)} className="ml-auto text-red-500 hover:text-red-700 font-bold text-lg">
          ✕
        </button>
      </div>
    </div>
  );
}

export default AlertBanner;