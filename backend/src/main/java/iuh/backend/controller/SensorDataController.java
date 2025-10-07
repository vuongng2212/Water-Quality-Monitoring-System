package iuh.backend.controller;

import iuh.backend.model.Device;
import iuh.backend.model.SensorData;
import iuh.backend.payload.request.SensorDataRequest;
import iuh.backend.repository.SensorDataRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sensor-data")
@RequiredArgsConstructor
public class SensorDataController {

    private final SensorDataRepository sensorDataRepository;

    @PostMapping
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
    @PreAuthorize("isAuthenticated()") // Will be refined in Day 6
    public ResponseEntity<Page<SensorData>> getSensorDataHistory(@PathVariable Long deviceId, Pageable pageable) {
        // TODO: Add permission check in Day 6
        Page<SensorData> history = sensorDataRepository.findByDeviceId(deviceId, pageable);
        return ResponseEntity.ok(history);
    }
}