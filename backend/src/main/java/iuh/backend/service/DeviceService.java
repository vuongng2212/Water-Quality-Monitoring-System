package iuh.backend.service;

import iuh.backend.config.TenantContext;
import iuh.backend.model.Device;
import iuh.backend.model.EmployeeDeviceAccess;
import iuh.backend.model.EmployeeDeviceAccessId;
import iuh.backend.model.Factory;
import iuh.backend.model.User;
import iuh.backend.model.enums.Role;
import iuh.backend.payload.request.CreateDeviceRequest;
import iuh.backend.payload.response.DeviceDto;
import iuh.backend.payload.response.DeviceSettingsDto;
import iuh.backend.payload.response.UserDto;
import iuh.backend.repository.DeviceRepository;
import iuh.backend.repository.EmployeeDeviceAccessRepository;
import iuh.backend.repository.FactoryRepository;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final FactoryRepository factoryRepository;
    private final UserRepository userRepository;
    private final EmployeeDeviceAccessRepository employeeDeviceAccessRepository;
    private final DeviceSettingsService deviceSettingsService;

    public DeviceDto createDevice(CreateDeviceRequest request) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }
        Factory factory = factoryRepository.findById(factoryId)
                .orElseThrow(() -> new RuntimeException("Factory not found with ID: " + factoryId));

        Device device = new Device();
        device.setName(request.getName());
        device.setFactory(factory);
        device.setApiKey(UUID.randomUUID().toString());

        Device savedDevice = deviceRepository.save(device);

        return toDto(savedDevice);
    }

    public List<DeviceDto> getDevices(UserDetails userDetails) {
        try {
            // Lấy thông tin người dùng từ username
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Current user not found: " + userDetails.getUsername()));

            System.out.println("User: " + currentUser.getUsername() + ", Role: " + currentUser.getRole() + ", Factory: " + (currentUser.getFactory() != null ? currentUser.getFactory().getId() : "null"));

            // Nếu là ADMIN, trả về tất cả thiết bị trong factory
            if (currentUser.getRole() == Role.ADMIN) {
                List<Device> devices = deviceRepository.findAll();
                System.out.println("Found " + devices.size() + " devices");
                return devices.stream()
                        .map(this::toDto)
                        .collect(Collectors.toList());
            }
            // Nếu là EMPLOYEE, chỉ trả về các thiết bị được phân quyền
            else if (currentUser.getRole() == Role.EMPLOYEE) {
                List<EmployeeDeviceAccess> accessList = employeeDeviceAccessRepository.findByUserId(currentUser.getId());
                Set<Long> accessibleDeviceIds = accessList.stream()
                        .map(access -> access.getId().getDeviceId())
                        .collect(Collectors.toSet());

                List<Device> accessibleDevices = deviceRepository.findAllById(accessibleDeviceIds);
                return accessibleDevices.stream()
                        .map(this::toDto)
                        .collect(Collectors.toList());
            }

            throw new AccessDeniedException("User role not recognized: " + currentUser.getRole());
        } catch (AccessDeniedException e) {
            throw e; // Ném lại ngoại lệ truy cập bị từ chối
        } catch (Exception e) {
            // Ghi log lỗi và ném lại một ngoại lệ chung
            System.err.println("Error in getDevices: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error retrieving devices: " + e.getMessage(), e);
        }
    }

    public DeviceDto getDevice(Long id) {
        Long factoryId = TenantContext.getTenantId();
        Device device = deviceRepository.findByIdAndFactoryId(id, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found or not in the same factory"));
        return toDto(device);
    }

    public DeviceDto updateDevice(Long id, CreateDeviceRequest request) {
        Long factoryId = TenantContext.getTenantId();
        Device device = deviceRepository.findByIdAndFactoryId(id, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found or not in the same factory"));
        device.setName(request.getName());
        Device updatedDevice = deviceRepository.save(device);
        return toDto(updatedDevice);
    }

    public void deleteDevice(Long id) {
        Long factoryId = TenantContext.getTenantId();
        Device device = deviceRepository.findByIdAndFactoryId(id, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found or not in the same factory"));
        deviceRepository.delete(device);
    }

    /**
     * Gán thiết bị cho nhân viên
     */
    public void assignDeviceToEmployee(Long deviceId, Long userId) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }

        // Kiểm tra thiết bị tồn tại và thuộc factory của admin
        Device device = deviceRepository.findByIdAndFactoryId(deviceId, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found or not in the same factory"));

        // Kiểm tra người dùng tồn tại và thuộc factory của admin
        User user = userRepository.findByIdAndFactoryId(userId, factoryId)
                .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

        // Kiểm tra người dùng là EMPLOYEE
        if (user.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Assigned user must be an EMPLOYEE");
        }

        // Tạo bản ghi phân quyền
        EmployeeDeviceAccessId accessId = new EmployeeDeviceAccessId(user.getId(), device.getId());
        EmployeeDeviceAccess access = new EmployeeDeviceAccess();
        access.setId(accessId);
        access.setUser(user);
        access.setDevice(device);

        employeeDeviceAccessRepository.save(access);
    }

    /**
     * Hủy gán thiết bị khỏi nhân viên
     */
    public void unassignDeviceFromEmployee(Long deviceId, Long userId) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }

        // Kiểm tra thiết bị tồn tại và thuộc factory của admin
        Device device = deviceRepository.findByIdAndFactoryId(deviceId, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found or not in the same factory"));

        // Kiểm tra người dùng tồn tại và thuộc factory của admin
        User user = userRepository.findByIdAndFactoryId(userId, factoryId)
                .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

        // Kiểm tra người dùng là EMPLOYEE
        if (user.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Assigned user must be an EMPLOYEE");
        }

        // Xóa bản ghi phân quyền
        employeeDeviceAccessRepository.deleteByUserIdAndDeviceId(userId, deviceId);
    }

    private DeviceDto toDto(Device device) {
        List<EmployeeDeviceAccess> accesses = employeeDeviceAccessRepository.findByDeviceId(device.getId());
        List<UserDto> assignedUsers = accesses.stream()
                .map(access -> UserDto.builder()
                        .id(access.getUser().getId())
                        .username(access.getUser().getUsername())
                        .email(access.getUser().getEmail())
                        .role(access.getUser().getRole())
                        .build())
                .collect(Collectors.toList());

        DeviceSettingsDto settings = deviceSettingsService.getDeviceSettings(device.getId());

        return DeviceDto.builder()
                .id(device.getId())
                .name(device.getName())
                .apiKey(device.getApiKey())
                .factoryId(device.getFactory().getId())
                .assignedUsers(assignedUsers)
                .settings(settings)
                .build();
    }
}