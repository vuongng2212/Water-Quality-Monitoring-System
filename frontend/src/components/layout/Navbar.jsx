import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">🌊 Giám sát Chất lượng Nước</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-20'}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-20'}`
                  }
                >
                  Lịch sử
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-20'}`
                    }
                  >
                    Người dùng
                  </NavLink>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">👤 {user?.name || 'User'} (Nhà máy Alpha)</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;