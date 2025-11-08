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

        System.out.println("Get settings for deviceId: " + deviceId + ", entity: valveOpen=" + settings.isValveOpen() + ", collectingData=" + settings.isCollectingData() + ", interval=" + settings.getDataIntervalSeconds());
        DeviceSettingsDto dto = toDto(settings);
        System.out.println("Get settings DTO: valveOpen=" + dto.isValveOpen() + ", collectingData=" + dto.isCollectingData() + ", interval=" + dto.getDataIntervalSeconds());
        return dto;
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

        System.out.println("Update settings - Before: valveOpen=" + settings.isValveOpen() + ", collectingData=" + settings.isCollectingData() + ", interval=" + settings.getDataIntervalSeconds());
        System.out.println("Update settings - Request: valveOpen=" + request.isValveOpen() + ", collectingData=" + request.isCollectingData() + ", interval=" + request.getDataIntervalSeconds());

        settings.setValveOpen(request.isValveOpen());
        settings.setCollectingData(request.isCollectingData());
        settings.setDataIntervalSeconds(request.getDataIntervalSeconds());

        DeviceSettings savedSettings = deviceSettingsRepository.save(settings);
        System.out.println("Update settings - After save: valveOpen=" + savedSettings.isValveOpen() + ", collectingData=" + savedSettings.isCollectingData() + ", interval=" + savedSettings.getDataIntervalSeconds());

        entityManager.flush();
        entityManager.clear();

        DeviceSettingsDto dto = toDto(savedSettings);
        System.out.println("Update settings - DTO: valveOpen=" + dto.isValveOpen() + ", collectingData=" + dto.isCollectingData() + ", interval=" + dto.getDataIntervalSeconds());
        return dto;
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
        entityManager.flush();
        entityManager.clear();
        return toDto(savedSettings);
    }

    public DeviceSettingsDto setCollectingData(Long deviceId, boolean collecting) {
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

        settings.setCollectingData(collecting);

        DeviceSettings savedSettings = deviceSettingsRepository.save(settings);
        entityManager.flush();
        entityManager.clear();
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
        entityManager.flush();
        entityManager.clear();
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