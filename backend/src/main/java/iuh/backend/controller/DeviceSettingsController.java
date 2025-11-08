package iuh.backend.controller;

import iuh.backend.model.Device;
import iuh.backend.payload.request.UpdateDeviceSettingsRequest;
import iuh.backend.payload.response.DeviceSettingsDto;
import iuh.backend.service.DeviceSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices/{deviceId}/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Device Settings", description = "APIs cho quản lý cài đặt thiết bị")
public class DeviceSettingsController {

    private final DeviceSettingsService deviceSettingsService;

        @GetMapping
    @Operation(summary = "Lấy cài đặt thiết bị", description = "Lấy cài đặt hiện tại của thiết bị")
    public ResponseEntity<DeviceSettingsDto> getDeviceSettings(@PathVariable Long deviceId) {
        DeviceSettingsDto settings = deviceSettingsService.getDeviceSettings(deviceId);
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    @Operation(summary = "Cập nhật cài đặt thiết bị", description = "Cập nhật cài đặt cho thiết bị")
    public ResponseEntity<DeviceSettingsDto> updateDeviceSettings(
            @PathVariable Long deviceId,
            @Valid @RequestBody UpdateDeviceSettingsRequest request) {
        System.out.println("Updating settings for deviceId: " + deviceId + ", request: " + request);
        DeviceSettingsDto updatedSettings = deviceSettingsService.updateDeviceSettings(deviceId, request);
        System.out.println("Updated settings: " + updatedSettings);
        return ResponseEntity.ok(updatedSettings);
    }
}