package iuh.backend.service;

import iuh.backend.config.TenantContext;
import iuh.backend.model.Device;
import iuh.backend.model.EmployeeDeviceAccess;
import iuh.backend.model.EmployeeDeviceAccessId;
import iuh.backend.model.User;
import iuh.backend.model.User.Role;
import iuh.backend.repository.DeviceRepository;
import iuh.backend.repository.EmployeeDeviceAccessRepository;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PermissionService {
    
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final EmployeeDeviceAccessRepository employeeDeviceAccessRepository;
    
    /**
     * Kiểm tra xem người dùng có quyền truy cập thiết bị cụ thể hay không
     * 
     * @param userDetails thông tin người dùng đang đăng nhập
     * @param deviceId ID của thiết bị cần kiểm tra quyền truy cập
     * @return true nếu người dùng có quyền truy cập, false nếu không
     */
    public boolean canAccessDevice(UserDetails userDetails, Long deviceId) {
        // Lấy thông tin người dùng từ username
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getUsername()));
        
        // Nếu là ADMIN, kiểm tra xem thiết bị có cùng factory không
        if (user.getRole() == Role.ADMIN) {
            Long factoryId = TenantContext.getTenantId();
            if (factoryId == null) {
                return false;
            }
            
            // Kiểm tra thiết bị có tồn tại và thuộc cùng factory không
            Optional<Device> deviceOpt = deviceRepository.findByIdAndFactoryId(deviceId, factoryId);
            return deviceOpt.isPresent();
        } 
        // Nếu là EMPLOYEE, kiểm tra trong bảng employee_device_access
        else if (user.getRole() == Role.EMPLOYEE) {
            // Kiểm tra xem có bản ghi phân quyền cho người dùng này và thiết bị này không
            EmployeeDeviceAccessId id = new EmployeeDeviceAccessId(user.getId(), deviceId);
            return employeeDeviceAccessRepository.existsById(id);
        }
        
        // Trường hợp khác (nếu có thêm vai trò trong tương lai)
        return false;
    }
    
    /**
     * Ném AccessDeniedException nếu người dùng không có quyền truy cập thiết bị
     * 
     * @param userDetails thông tin người dùng đang đăng nhập
     * @param deviceId ID của thiết bị cần kiểm tra quyền truy cập
     */
    public void validateDeviceAccess(UserDetails userDetails, Long deviceId) {
        if (!canAccessDevice(userDetails, deviceId)) {
            throw new AccessDeniedException("User does not have access to device: " + deviceId);
        }
    }
}