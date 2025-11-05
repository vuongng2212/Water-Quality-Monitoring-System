package iuh.backend.controller;

import iuh.backend.model.Device;
import iuh.backend.model.SensorData;
import iuh.backend.payload.request.SensorDataRequest;
import iuh.backend.repository.SensorDataRepository;
import iuh.backend.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sensor-data")
@RequiredArgsConstructor
@Tag(name = "Sensor Data", description = "APIs cho dữ liệu cảm biến từ thiết bị IoT")
public class SensorDataController {

    private final SensorDataRepository sensorDataRepository;
    private final PermissionService permissionService;

    @PostMapping
    @Operation(summary = "Nhận dữ liệu cảm biến", description = "Endpoint dành cho thiết bị IoT gửi dữ liệu cảm biến lên hệ thống. Yêu cầu xác thực bằng header X-API-KEY")
    public ResponseEntity<Void> receiveSensorData(@Valid @RequestBody SensorDataRequest request,
                                                  @AuthenticationPrincipal Device device) {
        SensorData sensorData = new SensorData();
        sensorData.setDevice(device);
        sensorData.setPh(request.getPh());
        sensorData.setTemperature(request.getTemperature());
        sensorData.setTurbidity(request.getTurbidity());
        sensorData.setConductivity(request.getConductivity());
        sensorData.setTimestamp(LocalDateTime.now());

        sensorDataRepository.save(sensorData);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/history/{deviceId}")
    @Operation(summary = "Lấy lịch sử dữ liệu cảm biến", description = "Lấy lịch sử dữ liệu của một thiết bị cụ thể (yêu cầu JWT)")
    public ResponseEntity<Page<SensorData>> getSensorDataHistory(
            @Parameter(description = "ID của thiết bị") @PathVariable Long deviceId,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Kiểm tra quyền truy cập thiết bị
        permissionService.validateDeviceAccess(userDetails, deviceId);
        
        Page<SensorData> history = sensorDataRepository.findByDeviceId(deviceId, pageable);
        return ResponseEntity.ok(history);
    }
}