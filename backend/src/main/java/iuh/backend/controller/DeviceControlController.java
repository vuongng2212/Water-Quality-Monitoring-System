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

import java.util.Map;

@RestController
@RequestMapping("/api/controls/devices/{deviceId}")
@RequiredArgsConstructor
@Tag(name = "Device Control", description = "APIs cho điều khiển thiết bị")
public class DeviceControlController {

    private final DeviceSettingsService deviceSettingsService;

    @PostMapping("/valve")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Điều khiển van nước", description = "Mở hoặc đóng van nước của thiết bị")
    public ResponseEntity<DeviceSettingsDto> controlValve(
            @PathVariable Long deviceId,
            @Valid @RequestBody ValveControlRequest request) {
        DeviceSettingsDto updatedSettings = deviceSettingsService.controlValve(deviceId, request.getOpen());
        return ResponseEntity.ok(updatedSettings);
    }

    @PutMapping("/interval")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Cập nhật khoảng thời gian gửi dữ liệu", description = "Cập nhật khoảng thời gian gửi dữ liệu của thiết bị")
    public ResponseEntity<DeviceSettingsDto> setDataInterval(@PathVariable Long deviceId, @RequestBody Map<String, Integer> request) {
        int interval = request.get("interval");
        DeviceSettingsDto settings = deviceSettingsService.setDataInterval(deviceId, interval);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/collecting")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Cập nhật trạng thái thu thập dữ liệu", description = "Bật/tắt thu thập dữ liệu của thiết bị")
    public ResponseEntity<DeviceSettingsDto> setCollectingData(@PathVariable Long deviceId, @RequestBody Map<String, Boolean> request) {
        boolean collecting = request.get("collecting");
        DeviceSettingsDto settings = deviceSettingsService.setCollectingData(deviceId, collecting);
        return ResponseEntity.ok(settings);
    }
}