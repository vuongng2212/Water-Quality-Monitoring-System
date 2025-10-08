package iuh.backend.controller;

import iuh.backend.model.User;
import iuh.backend.payload.request.AssignEmployeeRequest;
import iuh.backend.payload.request.CreateDeviceRequest;
import iuh.backend.payload.response.DeviceDto;
import iuh.backend.service.DeviceService;
import iuh.backend.service.PermissionService;
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
public class DeviceController {

    private final DeviceService deviceService;
    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<DeviceDto> createDevice(@Valid @RequestBody CreateDeviceRequest request) {
        DeviceDto createdDevice = deviceService.createDevice(request);
        return new ResponseEntity<>(createdDevice, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DeviceDto>> getDevices(@AuthenticationPrincipal UserDetails userDetails) {
        List<DeviceDto> devices = deviceService.getDevices(userDetails);
        return ResponseEntity.ok(devices);
    }

    @GetMapping("/{id}")
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