import React, { useState, useEffect } from 'react';

// Define thresholds matching backend AlertService
const thresholds = {
  ph: { min: 6.5, max: 8.5 },
  temperature: { max: 30 }, // Celsius - only max threshold
  turbidity: { max: 5 }, // NTU
  conductivity: { max: 1000 } // µS/cm
};

function AlertBanner({ metrics = {} }) {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Check for alerts based on metrics
  useEffect(() => {
    const newAlerts = [];

    // Check pH
    if (metrics.ph?.value !== null) {
      if (metrics.ph.value < thresholds.ph.min) {
        newAlerts.push({
          id: 'ph-low',
          type: 'warning',
          message: `pH quá thấp: ${metrics.ph.value} (ngưỡng: ${thresholds.ph.min}-${thresholds.ph.max})`,
          icon: '⚠️'
        });
      } else if (metrics.ph.value > thresholds.ph.max) {
        newAlerts.push({
          id: 'ph-high',
          type: 'danger',
          message: `pH quá cao: ${metrics.ph.value} (ngưỡng: ${thresholds.ph.min}-${thresholds.ph.max})`,
          icon: '🚨'
        });
      }
    }

    // Check temperature - only max threshold like backend
    if (metrics.temperature?.value !== null && metrics.temperature.value > thresholds.temperature.max) {
      newAlerts.push({
        id: 'temp-high',
        type: 'danger',
        message: `Nhiệt độ quá cao: ${metrics.temperature.value}°C (ngưỡng tối đa: ${thresholds.temperature.max}°C)`,
        icon: '🔥'
      });
    }

    // Check turbidity
    if (metrics.turbidity?.value !== null && metrics.turbidity.value > thresholds.turbidity.max) {
      newAlerts.push({
        id: 'turbidity-high',
        type: 'warning',
        message: `Độ đục quá cao: ${metrics.turbidity.value} NTU (ngưỡng tối đa: ${thresholds.turbidity.max} NTU)`,
        icon: '🌊'
      });
    }

    // Check conductivity
    if (metrics.conductivity?.value !== null && metrics.conductivity.value > thresholds.conductivity.max) {
      newAlerts.push({
        id: 'conductivity-high',
        type: 'warning',
        message: `Độ dẫn điện quá cao: ${metrics.conductivity.value} µS/cm (ngưỡng tối đa: ${thresholds.conductivity.max} µS/cm)`,
        icon: '⚡'
      });
    }

    setAlerts(newAlerts);
  }, [metrics]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className="mb-6 space-y-2">
      {visibleAlerts.map((alert) => (
        <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg shadow-md animate-pulse ${getAlertStyle(alert.type)}`}>
          <div className="flex items-center">
            <span className="text-xl mr-2">{alert.icon}</span>
            <span className="font-medium flex-1">{alert.message}</span>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="ml-2 hover:opacity-70 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AlertBanner;