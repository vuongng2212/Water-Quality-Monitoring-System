import React, { useState, useEffect } from 'react';
import { deviceAPI, userAPI } from '@/utils/api.js';
import { useAuth } from '../contexts/AuthContext';

function DeviceManagementPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [assigningDevice, setAssigningDevice] = useState(null);
    const [configuringDevice, setConfiguringDevice] = useState(null);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [assignData, setAssignData] = useState({
        userId: ''
    });
    const [settingsData, setSettingsData] = useState({
        isValveOpen: false,
        isCollectingData: true,
        dataIntervalSeconds: 10
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch devices and users on component mount
    useEffect(() => {
        fetchDevices();
        fetchUsers();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            setError('');
            const devicesData = await deviceAPI.getDevices();
            setDevices(devicesData);
        } catch (err) {
            console.error('Error fetching devices:', err);
            setError('Không thể tải danh sách thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersData = await userAPI.getUsers();
            setUsers(usersData);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleCreateDevice = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            await deviceAPI.createDevice(formData);
            setShowCreateModal(false);
            setFormData({ name: '' });
            fetchDevices(); // Refresh list
        } catch (err) {
            console.error('Error creating device:', err);
            setError('Không thể tạo thiết bị');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditDevice = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            await deviceAPI.updateDevice(editingDevice.id, formData);
            setEditingDevice(null);
            setFormData({ name: '' });
            fetchDevices(); // Refresh list
        } catch (err) {
            console.error('Error updating device:', err);
            setError('Không thể cập nhật thiết bị');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
        try {
            await deviceAPI.deleteDevice(deviceId);
            fetchDevices(); // Refresh list
        } catch (err) {
            console.error('Error deleting device:', err);
            setError('Không thể xóa thiết bị');
        }
    };

    const handleAssignDevice = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            await deviceAPI.assignDevice(assigningDevice.id, assignData.userId);
            setAssigningDevice(null);
            setAssignData({ userId: '' });
            fetchDevices(); // Refresh list
        } catch (err) {
            console.error('Error assigning device:', err);
            setError('Không thể phân quyền thiết bị');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnassignDevice = async (deviceId, userId) => {
        if (!window.confirm('Bạn có chắc muốn hủy phân quyền thiết bị này?')) return;
        try {
            await deviceAPI.unassignDevice(deviceId, userId);
            fetchDevices(); // Refresh list
        } catch (err) {
            console.error('Error unassigning device:', err);
            setError('Không thể hủy phân quyền thiết bị');
        }
    };

    const openEditModal = (device) => {
        setEditingDevice(device);
        setFormData({ name: device.name });
    };

    const openAssignModal = (device) => {
        setAssigningDevice(device);
        setAssignData({ userId: '' });
    };

    const handleConfigureDevice = async (device) => {
        setConfiguringDevice(device);
        try {
            const settings = await deviceAPI.getDeviceSettings(device.id);
            setSettingsData({
                isValveOpen: settings.isValveOpen,
                isCollectingData: settings.isCollectingData,
                dataIntervalSeconds: settings.dataIntervalSeconds
            });
        } catch (err) {
            console.error('Error fetching device settings:', err);
            setError('Không thể tải cài đặt thiết bị');
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            await deviceAPI.updateDeviceSettings(configuringDevice.id, settingsData);
            setConfiguringDevice(null);
            setSettingsData({
                isValveOpen: false,
                isCollectingData: true,
                dataIntervalSeconds: 10
            });
            fetchDevices(); // Refresh list
        } catch (err) {
            console.error('Error updating device settings:', err);
            setError('Không thể cập nhật cài đặt thiết bị');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Đang tải...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Bạn không có quyền truy cập trang này. Chỉ ADMIN mới có thể quản lý thiết bị.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Thêm thiết bị
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên được phân quyền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {devices.map((device) => (
                            <tr key={device.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{device.apiKey}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {device.assignedUsers && device.assignedUsers.length > 0
                                        ? device.assignedUsers.map(user => user.username).join(', ')
                                        : 'Chưa phân quyền'
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(device)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => openAssignModal(device)}
                                        className="text-green-600 hover:text-green-900 mr-2"
                                    >
                                        Phân quyền
                                    </button>
                                    <button
                                        onClick={() => handleConfigureDevice(device)}
                                        className="text-blue-600 hover:text-blue-900 mr-2"
                                    >
                                        Cấu hình
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDevice(device.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Device Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm thiết bị mới</h3>
                            <form onSubmit={handleCreateDevice}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Tên thiết bị</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Device Modal */}
            {editingDevice && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Sửa thiết bị</h3>
                            <form onSubmit={handleEditDevice}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Tên thiết bị</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setEditingDevice(null)}
                                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Device Modal */}
            {assigningDevice && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Phân quyền thiết bị: {assigningDevice.name}</h3>
                            <form onSubmit={handleAssignDevice}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Chọn nhân viên</label>
                                    <select
                                        value={assignData.userId}
                                        onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        <option value="">Chọn nhân viên</option>
                                        {users.filter(user => user.role === 'EMPLOYEE').map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.username} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setAssigningDevice(null)}
                                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang phân quyền...' : 'Phân quyền'}
                                    </button>
                                </div>
                            </form>
                            {/* List assigned users with unassign buttons */}
                            {assigningDevice.assignedUsers && assigningDevice.assignedUsers.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Đã phân quyền cho:</h4>
                                    {assigningDevice.assignedUsers.map((user) => (
                                        <div key={user.id} className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">{user.username}</span>
                                            <button
                                                onClick={() => handleUnassignDevice(assigningDevice.id, user.id)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Configure Device Modal */}
            {configuringDevice && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Cấu hình thiết bị: {configuringDevice.name}</h3>
                            <form onSubmit={handleUpdateSettings}>
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settingsData.isValveOpen}
                                            onChange={(e) => setSettingsData({ ...settingsData, isValveOpen: e.target.checked })}
                                            className="mr-2"
                                        />
                                        Mở van
                                    </label>
                                </div>
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settingsData.isCollectingData}
                                            onChange={(e) => setSettingsData({ ...settingsData, isCollectingData: e.target.checked })}
                                            className="mr-2"
                                        />
                                        Thu thập dữ liệu
                                    </label>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Khoảng thời gian thu thập (giây)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={settingsData.dataIntervalSeconds}
                                        onChange={(e) => setSettingsData({ ...settingsData, dataIntervalSeconds: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfiguringDevice(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeviceManagementPage;