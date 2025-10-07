package iuh.backend.controller;

import iuh.backend.model.User;
import iuh.backend.payload.request.CreateDeviceRequest;
import iuh.backend.payload.response.DeviceDto;
import iuh.backend.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping
    public ResponseEntity<DeviceDto> createDevice(@Valid @RequestBody CreateDeviceRequest request,
                                                  @AuthenticationPrincipal User user) {
        DeviceDto createdDevice = deviceService.createDevice(request, user.getUsername());
        return new ResponseEntity<>(createdDevice, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DeviceDto>> getDevices(@AuthenticationPrincipal User user) {
        List<DeviceDto> devices = deviceService.getDevices(user.getUsername());
        return ResponseEntity.ok(devices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceDto> getDevice(@PathVariable Long id,
                                               @AuthenticationPrincipal User user) {
        DeviceDto device = deviceService.getDevice(id, user.getUsername());
        return ResponseEntity.ok(device);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceDto> updateDevice(@PathVariable Long id,
                                                  @Valid @RequestBody CreateDeviceRequest request,
                                                  @AuthenticationPrincipal User user) {
        DeviceDto updatedDevice = deviceService.updateDevice(id, request, user.getUsername());
        return ResponseEntity.ok(updatedDevice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id,
                                             @AuthenticationPrincipal User user) {
        deviceService.deleteDevice(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}