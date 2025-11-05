import React from 'react';

function ViewControls() {
  // Logic for switching roles and devices will be added later
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-md items-center">
      <div className="flex items-center space-x-2">
        <label htmlFor="roleSwitcher" className="text-sm font-medium text-gray-700">Xem với vai trò:</label>
        <select id="roleSwitcher" className="border border-gray-300 rounded-md px-3 py-2" defaultValue="ADMIN">
          <option value="ADMIN">Admin</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="deviceSwitcher" className="text-sm font-medium text-gray-700">Thiết bị:</label>
        <select id="deviceSwitcher" className="border border-gray-300 rounded-md px-3 py-2">
          {/* Options will be populated dynamically */}
          <option>Hồ chứa số 1</option>
          <option>Khu xử lý nước thải</option>
        </select>
      </div>
    </div>
  );
}

export default ViewControls;