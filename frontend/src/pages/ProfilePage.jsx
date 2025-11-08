import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api.js';

function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Profile form
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });

    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Update profile data when user loads
    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!user?.id) {
            setMessage('Đang tải dữ liệu người dùng, vui lòng đợi...');
            setLoading(false);
            return;
        }

        try {
            await userAPI.updateUser(user.id, profileData);
            setMessage('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (!user?.id) {
            setMessage('Đang tải dữ liệu người dùng, vui lòng đợi...');
            setLoading(false);
            return;
        }

        try {
            // Use separate API for password change
            await userAPI.changePassword(user.id, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage('Đổi mật khẩu thành công!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage(error.response?.data || 'Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    }; return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Thông tin cá nhân
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Đổi mật khẩu
                    </button>
                </nav>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa thông tin</h2>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Tên đăng nhập
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Vai trò
                            </label>
                            <input
                                type="text"
                                value={user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
                    <form onSubmit={handlePasswordChange}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                                Mật khẩu mới
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;