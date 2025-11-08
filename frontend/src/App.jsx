import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

import MainLayout from './components/layout/MainLayout';
import UserManagementPage from './pages/UserManagementPage'; // Will create this
import HistoryPage from './pages/HistoryPage'; // Will create this
import DeviceManagementPage from './pages/DeviceManagementPage';

function DashboardRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // This will eventually contain all the routes for the authenticated user
  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        {isAdmin && <Route path="/users" element={<UserManagementPage />} />}
        {isAdmin && <Route path="/devices" element={<DeviceManagementPage />} />}
        {/* Add other dashboard-related routes here */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainLayout>
  )
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
