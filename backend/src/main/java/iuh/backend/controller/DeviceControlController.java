package iuh.backend.controller;

import iuh.backend.model.DeviceSettings;
import iuh.backend.payload.request.DeviceControlRequest;
import iuh.backend.service.DeviceService;
import iuh.backend.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Device Controls", description = "APIs for controlling device settings and operations")
@RestController
@RequestMapping("/api/controls")
@RequiredArgsConstructor
public class DeviceControlController {

    private final DeviceService deviceService;
    private final PermissionService permissionService;

    @Operation(summary = "Control valve status", description = "Open or close the valve of a specific device")
    @PostMapping("/devices/{deviceId}/valve")
    public ResponseEntity<?> controlValve(@PathVariable Long deviceId, 
                                         @RequestBody DeviceControlRequest request, 
                                         Authentication authentication) {
        // Validate device access
        permissionService.validateDeviceAccess(authentication.getName(), deviceId);
        
        // Find device settings
        DeviceSettings settings = deviceService.getDeviceSettingsByDeviceId(deviceId);
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Update valve status
        settings.setIsValveOpen(request.isOpen());
        deviceService.saveDeviceSettings(settings);
        
        return ResponseEntity.ok().body(settings);
    }

    @Operation(summary = "Change data collection interval", description = "Change the data collection interval of a specific device")
    @PostMapping("/devices/{deviceId}/interval")
    public ResponseEntity<?> changeInterval(@PathVariable Long deviceId, 
                                           @RequestBody DeviceControlRequest request, 
                                           Authentication authentication) {
        // Validate device access
        permissionService.validateDeviceAccess(authentication.getName(), deviceId);
        
        // Find device settings
        DeviceSettings settings = deviceService.getDeviceSettingsByDeviceId(deviceId);
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Update interval
        settings.setDataIntervalSeconds(request.getInterval());
        deviceService.saveDeviceSettings(settings);
        
        return ResponseEntity.ok().body(settings);
    }
}