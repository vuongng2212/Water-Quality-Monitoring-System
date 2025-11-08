package iuh.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.backend.config.TenantContext;
import iuh.backend.model.Device;
import iuh.backend.model.DeviceSettings;
import iuh.backend.payload.request.UpdateDeviceSettingsRequest;
import iuh.backend.payload.response.DeviceSettingsDto;
import iuh.backend.repository.DeviceRepository;
import iuh.backend.repository.DeviceSettingsRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceSettingsService {

    private final DeviceSettingsRepository deviceSettingsRepository;
    private final DeviceRepository deviceRepository;
    private final EntityManager entityManager;

    public DeviceSettingsDto getDeviceSettings(Long deviceId) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + deviceId));

        // Verify device belongs to current factory
        if (!device.getFactory().getId().equals(factoryId)) {
            throw new RuntimeException("Device does not belong to current factory");
        }

        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(deviceId)
                .orElseGet(() -> createDefaultSettings(device));

        return toDto(settings);
    }

    public DeviceSettingsDto updateDeviceSettings(Long deviceId, UpdateDeviceSettingsRequest request) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + deviceId));

        // Verify device belongs to current factory
        if (!device.getFactory().getId().equals(factoryId)) {
            throw new RuntimeException("Device does not belong to current factory");
        }

        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(deviceId)
                .orElseGet(() -> createDefaultSettings(device));

        settings.setValveOpen(request.isValveOpen());
        settings.setCollectingData(request.isCollectingData());
        settings.setDataIntervalSeconds(request.getDataIntervalSeconds());

        DeviceSettings savedSettings = deviceSettingsRepository.save(settings);
        System.out.println("Updated device settings for deviceId: " + deviceId + ", new settings: " + toDto(savedSettings));
        entityManager.flush();
        entityManager.clear();
        return toDto(savedSettings);
    }

    public DeviceSettingsDto controlValve(Long deviceId, boolean open) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + deviceId));

        // Verify device belongs to current factory
        if (!device.getFactory().getId().equals(factoryId)) {
            throw new RuntimeException("Device does not belong to current factory");
        }

        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(deviceId)
                .orElseGet(() -> createDefaultSettings(device));

        settings.setValveOpen(open);

        DeviceSettings savedSettings = deviceSettingsRepository.save(settings);
        return toDto(savedSettings);
    }

    public DeviceSettingsDto setDataInterval(Long deviceId, int interval) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new IllegalStateException("Factory ID not found in tenant context.");
        }

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + deviceId));

        // Verify device belongs to current factory
        if (!device.getFactory().getId().equals(factoryId)) {
            throw new RuntimeException("Device does not belong to current factory");
        }

        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(deviceId)
                .orElseGet(() -> createDefaultSettings(device));

        settings.setDataIntervalSeconds(interval);

        DeviceSettings savedSettings = deviceSettingsRepository.save(settings);
        return toDto(savedSettings);
    }

    private DeviceSettings createDefaultSettings(Device device) {
        DeviceSettings settings = DeviceSettings.builder()
                .device(device)
                .isValveOpen(false)
                .isCollectingData(true)
                .dataIntervalSeconds(10)
                .build();
        return deviceSettingsRepository.save(settings);
    }

    private DeviceSettingsDto toDto(DeviceSettings settings) {
        return DeviceSettingsDto.builder()
                .isValveOpen(settings.isValveOpen())
                .isCollectingData(settings.isCollectingData())
                .dataIntervalSeconds(settings.getDataIntervalSeconds())
                .build();
    }
}