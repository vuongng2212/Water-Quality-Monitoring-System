import React, { useState } from 'react';

function AlertBanner() {
  const [visible, setVisible] = useState(false); // Example state
  const [message, setMessage] = useState('Cảnh báo: pH vượt ngưỡng an toàn!');

  if (!visible) {
    return null;
  }

  return (
    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-pulse">
      <div className="flex items-center">
        <span className="text-xl mr-2">⚠️</span>
        <span>{message}</span>
        <button onClick={() => setVisible(false)} className="ml-auto text-red-500 hover:text-red-700">
          ✕
        </button>
      </div>
    </div>
  );
}

export default AlertBanner;