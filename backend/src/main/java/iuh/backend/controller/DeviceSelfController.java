package iuh.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.backend.model.Device;
import iuh.backend.payload.response.DeviceSettingsDto;
import iuh.backend.service.DeviceSettingsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
@Tag(name = "Device Self Settings", description = "APIs cho thiết bị tự lấy cài đặt của mình")
public class DeviceSelfController {

    private final DeviceSettingsService deviceSettingsService;

    @GetMapping("/settings")
    @Operation(summary = "Lấy cài đặt của thiết bị", description = "Thiết bị lấy cài đặt của chính mình bằng API key")
    public ResponseEntity<DeviceSettingsDto> getMySettings(HttpServletRequest request) {
        // Get device from API key authentication
        Authentication authentication = (Authentication) request.getUserPrincipal();
        if (authentication == null || !(authentication.getPrincipal() instanceof Device)) {
            throw new RuntimeException("Device authentication required");
        }

        Device device = (Device) authentication.getPrincipal();
        System.out.println("Fetching settings for device: " + device.getId() + " (" + device.getName() + ")");
        DeviceSettingsDto settings = deviceSettingsService.getDeviceSettings(device.getId());
        System.out.println("Fetched settings: " + settings);
        return ResponseEntity.ok(settings);
    }
}