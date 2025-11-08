package iuh.backend.controller;

import iuh.backend.payload.request.ValveControlRequest;
import iuh.backend.payload.request.DataIntervalRequest;
import iuh.backend.payload.response.DeviceSettingsDto;
import iuh.backend.service.DeviceSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/controls/devices/{deviceId}")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Device Control", description = "APIs cho điều khiển thiết bị")
public class DeviceControlController {

    private final DeviceSettingsService deviceSettingsService;

    @PostMapping("/valve")
    @Operation(summary = "Điều khiển van nước", description = "Mở hoặc đóng van nước của thiết bị")
    public ResponseEntity<DeviceSettingsDto> controlValve(
            @PathVariable Long deviceId,
            @Valid @RequestBody ValveControlRequest request) {
        DeviceSettingsDto updatedSettings = deviceSettingsService.controlValve(deviceId, request.getOpen());
        return ResponseEntity.ok(updatedSettings);
    }

    @PostMapping("/interval")
    @Operation(summary = "Thiết lập khoảng thời gian thu thập dữ liệu", description = "Thiết lập khoảng thời gian thu thập dữ liệu cho thiết bị")
    public ResponseEntity<DeviceSettingsDto> setDataInterval(
            @PathVariable Long deviceId,
            @Valid @RequestBody DataIntervalRequest request) {
        DeviceSettingsDto updatedSettings = deviceSettingsService.setDataInterval(deviceId, request.getInterval());
        return ResponseEntity.ok(updatedSettings);
    }
}