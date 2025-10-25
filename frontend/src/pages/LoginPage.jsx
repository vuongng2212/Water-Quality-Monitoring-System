import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // This is a mock login. We'll replace this with a real API call later.
    const mockUserData = { token: 'fake-jwt-token', name: 'Admin', role: 'ADMIN' };
    login(mockUserData);
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Đăng nhập (Giả lập)
        </button>
      </div>
    </div>
  );
}

export default LoginPage;