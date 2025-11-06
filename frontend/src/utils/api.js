import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token và chuyển hướng về trang đăng nhập
      localStorage.removeItem('token');
      window.location.href = '/login'; // Hoặc sử dụng navigate nếu trong component
    }
    return Promise.reject(error);
  }
);

export default api;

// ==================== AUTH APIs ====================
const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  }
};

// ==================== USER APIs ====================
const userAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

// ==================== DEVICE APIs ====================
const deviceAPI = {
  getDevices: async () => {
    const response = await api.get('/devices');
    return response.data;
  },

  createDevice: async (deviceData) => {
    const response = await api.post('/devices', deviceData);
    return response.data;
  },

  getDevice: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data;
  },

  updateDevice: async (deviceId, deviceData) => {
    const response = await api.put(`/devices/${deviceId}`, deviceData);
    return response.data;
  },

  deleteDevice: async (deviceId) => {
    await api.delete(`/devices/${deviceId}`);
  },

  assignDevice: async (deviceId, userId) => {
    const response = await api.post(`/devices/${deviceId}/assign`, { userId });
    return response.data;
  },

  unassignDevice: async (deviceId, userId) => {
    const response = await api.post(`/devices/${deviceId}/unassign`, { userId });
    return response.data;
  }
};

// ==================== SENSOR DATA APIs ====================
const sensorDataAPI = {
  getLatest: async (deviceId = null) => {
    const url = deviceId ? `/sensor-data/latest?deviceId=${deviceId}` : '/sensor-data/latest';
    const response = await api.get(url);
    return response.data;
  },

  getHistory: async (deviceId = null, startDate = null, endDate = null, limit = 100) => {
    if (!deviceId) {
      throw new Error('deviceId is required for history');
    }
    let url = `/sensor-data/history/${deviceId}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    url += `limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  },

  // For real-time polling
  getLatestForDashboard: async () => {
    const response = await api.get('/sensor-data/dashboard');
    return response.data;
  }
};

// ==================== DEVICE CONTROL APIs ====================
const deviceControlAPI = {
  controlValve: async (deviceId, open) => {
    const response = await api.post(`/controls/devices/${deviceId}/valve`, { open });
    return response.data;
  },

  setDataInterval: async (deviceId, interval) => {
    const response = await api.post(`/controls/devices/${deviceId}/interval`, { interval });
    return response.data;
  },

  getDeviceSettings: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}/settings`);
    return response.data;
  }
};

// Export all APIs as named exports
export { authAPI, userAPI, deviceAPI, sensorDataAPI, deviceControlAPI };