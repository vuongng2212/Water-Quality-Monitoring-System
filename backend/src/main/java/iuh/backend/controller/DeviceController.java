package iuh.backend.controller;

import iuh.backend.model.User;
import iuh.backend.payload.request.AssignEmployeeRequest;
import iuh.backend.payload.request.CreateDeviceRequest;
import iuh.backend.payload.response.DeviceDto;
import iuh.backend.service.DeviceService;
import iuh.backend.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@Tag(name = "Device Management", description = "APIs cho quản lý thiết bị (chỉ dành cho ADMIN)")
public class DeviceController {

    private final DeviceService deviceService;
    private final PermissionService permissionService;

    @PostMapping
    @Operation(summary = "Tạo thiết bị mới", description = "Tạo một thiết bị mới, hệ thống sẽ tự động sinh API Key")
    public ResponseEntity<DeviceDto> createDevice(@Valid @RequestBody CreateDeviceRequest request) {
        DeviceDto createdDevice = deviceService.createDevice(request);
        return new ResponseEntity<>(createdDevice, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy danh sách thiết bị", description = "Lấy danh sách tất cả thiết bị trong nhà máy")
    public ResponseEntity<List<DeviceDto>> getDevices(@AuthenticationPrincipal UserDetails userDetails) {
        List<DeviceDto> devices = deviceService.getDevices(userDetails);
        return ResponseEntity.ok(devices);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin thiết bị", description = "Lấy thông tin chi tiết một thiết bị")
    public ResponseEntity<DeviceDto> getDevice(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Kiểm tra quyền truy cập thiết bị
            permissionService.validateDeviceAccess(userDetails, id);
            
            DeviceDto device = deviceService.getDevice(id);
            return ResponseEntity.ok(device);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thiết bị", description = "Cập nhật tên thiết bị")
    public ResponseEntity<DeviceDto> updateDevice(@PathVariable Long id,
                                                  @Valid @RequestBody CreateDeviceRequest request) {
        try {
            DeviceDto updatedDevice = deviceService.updateDevice(id, request);
            return ResponseEntity.ok(updatedDevice);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa thiết bị", description = "Xóa một thiết bị")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        try {
            deviceService.deleteDevice(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/{deviceId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Phân quyền thiết bị cho nhân viên", description = "Gán thiết bị cho nhân viên")
    public ResponseEntity<?> assignDeviceToEmployee(@PathVariable Long deviceId,
                                                   @RequestBody AssignEmployeeRequest request) {
        try {
            deviceService.assignDeviceToEmployee(deviceId, request.getUserId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/{deviceId}/unassign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Hủy phân quyền thiết bị cho nhân viên", description = "Hủy gán thiết bị khỏi nhân viên")
    public ResponseEntity<?> unassignDeviceFromEmployee(@PathVariable Long deviceId,
                                                       @RequestBody AssignEmployeeRequest request) {
        try {
            deviceService.unassignDeviceFromEmployee(deviceId, request.getUserId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

}