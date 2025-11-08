
package iuh.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import iuh.backend.model.Device;
import iuh.backend.model.SensorData;
import iuh.backend.payload.request.SensorDataRequest;
import iuh.backend.payload.response.SensorDataDto;
import iuh.backend.repository.SensorDataRepository;
import iuh.backend.service.PermissionService;
import iuh.backend.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/sensor-data")
@RequiredArgsConstructor
@Tag(name = "Sensor Data", description = "APIs cho dữ liệu cảm biến từ thiết bị IoT")
public class SensorDataController {

    private final SensorDataRepository sensorDataRepository;
    private final PermissionService permissionService;
    private final AlertService alertService;

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

        SensorData saved = sensorDataRepository.save(sensorData);
        System.out.println("[SENSOR_DATA] Nhận dữ liệu từ device " + device.getId() + " (" + device.getName() + "): " +
                          "pH=" + request.getPh() + ", temp=" + request.getTemperature() + ", turbidity=" + request.getTurbidity() + ", conductivity=" + request.getConductivity() +
                          ", timestamp=" + saved.getTimestamp() + ", id=" + saved.getId());

        // Check for alerts
        alertService.checkAndSendAlerts(device, request.getPh(), request.getTemperature(), request.getTurbidity(), request.getConductivity());

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/history/{deviceId}")
    @Operation(summary = "Lấy lịch sử dữ liệu cảm biến", description = "Lấy lịch sử dữ liệu của một thiết bị cụ thể (yêu cầu JWT)")
    public ResponseEntity<Page<SensorDataDto>> getSensorDataHistory(
            @Parameter(description = "ID của thiết bị") @PathVariable Long deviceId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "100") int limit,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Kiểm tra quyền truy cập thiết bị
        permissionService.validateDeviceAccess(userDetails, deviceId);
        
        Page<SensorData> history;
        Pageable queryPageable;
        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            queryPageable = org.springframework.data.domain.PageRequest.of(0, limit, 
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));
            history = sensorDataRepository.findByDeviceIdAndTimestampBetween(deviceId, start, end, queryPageable);
        } else {
            queryPageable = org.springframework.data.domain.PageRequest.of(0, limit, 
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));
            history = sensorDataRepository.findByDeviceId(deviceId, queryPageable);
        }
        
        System.out.println("[SENSOR_DATA_HISTORY] Device " + deviceId + ", startDate=" + startDate + ", endDate=" + endDate + ", limit=" + limit + 
                          ", totalElements=" + history.getTotalElements() + ", totalPages=" + history.getTotalPages());
        
        if (!history.getContent().isEmpty()) {
            SensorData first = history.getContent().get(0);
            SensorData last = history.getContent().get(history.getContent().size() - 1);
            System.out.println("[SENSOR_DATA_HISTORY] First record: id=" + first.getId() + ", timestamp=" + first.getTimestamp() + 
                              ", pH=" + first.getPh() + ", temp=" + first.getTemperature());
            System.out.println("[SENSOR_DATA_HISTORY] Last record: id=" + last.getId() + ", timestamp=" + last.getTimestamp() + 
                              ", pH=" + last.getPh() + ", temp=" + last.getTemperature());
        }
        
        Page<SensorDataDto> dtoPage = history.map(data -> SensorDataDto.builder()
                .id(data.getId())
                .ph(data.getPh())
                .temperature(data.getTemperature())
                .turbidity(data.getTurbidity())
                .conductivity(data.getConductivity())
                .timestamp(data.getTimestamp())
                .deviceId(data.getDevice().getId())
                .build());
        return ResponseEntity.ok(dtoPage);
    }
}