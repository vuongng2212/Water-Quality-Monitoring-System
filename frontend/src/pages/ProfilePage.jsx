import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api.js';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { theme } from '../utils/theme';

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
        <div className={`${theme.spacing.page} ${theme.spacing.section} max-w-4xl mx-auto`}>
            <div className="mb-8">
                <h1 className={`${theme.typography.h1} mb-2`}>Cài đặt tài khoản</h1>
                <p className={`${theme.typography.body} text-gray-600`}>
                    Quản lý thông tin cá nhân và bảo mật tài khoản
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Thông tin cá nhân
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Đổi mật khẩu
                    </button>
                </nav>
            </div>

            {message && (
                <Card className={`mb-6 ${message.includes('thành công') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className={message.includes('thành công') ? 'text-green-700' : 'text-red-700'}>
                        {message}
                    </div>
                </Card>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <Card>
                    <Card.Header>
                        <h2 className={theme.typography.h2}>Chỉnh sửa thông tin cá nhân</h2>
                    </Card.Header>
                    <Card.Content>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <Input
                                label="Tên đăng nhập"
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò
                                </label>
                                <input
                                    type="text"
                                    value={user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    disabled
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                                </Button>
                            </div>
                        </form>
                    </Card.Content>
                </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <Card>
                    <Card.Header>
                        <h2 className={theme.typography.h2}>Đổi mật khẩu</h2>
                    </Card.Header>
                    <Card.Content>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <Input
                                label="Mật khẩu hiện tại"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                            <Input
                                label="Mật khẩu mới"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                            <Input
                                label="Xác nhận mật khẩu mới"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                                </Button>
                            </div>
                        </form>
                    </Card.Content>
                </Card>
            )}
        </div>
    );
}

export default ProfilePage;