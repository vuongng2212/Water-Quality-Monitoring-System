package iuh.backend.service;

import iuh.backend.model.Device;
import iuh.backend.model.Factory;
import iuh.backend.model.User;
import iuh.backend.payload.request.CreateDeviceRequest;
import iuh.backend.payload.response.DeviceDto;
import iuh.backend.repository.DeviceRepository;
import iuh.backend.repository.FactoryRepository;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final FactoryRepository factoryRepository;
    private final UserRepository userRepository;

    public DeviceDto createDevice(CreateDeviceRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        Factory factory = user.getFactory();
        if (factory == null) {
            throw new IllegalStateException("User is not associated with a factory.");
        }

        Device device = new Device();
        device.setName(request.getName());
        device.setFactory(factory);
        device.setApiKey(UUID.randomUUID().toString());

        Device savedDevice = deviceRepository.save(device);

        return toDto(savedDevice);
    }

    public List<DeviceDto> getDevices(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        Long factoryId = user.getFactory().getId();
        return deviceRepository.findByFactoryId(factoryId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DeviceDto getDevice(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        Long factoryId = user.getFactory().getId();
        Device device = deviceRepository.findByIdAndFactoryId(id, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        return toDto(device);
    }

    public DeviceDto updateDevice(Long id, CreateDeviceRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        Long factoryId = user.getFactory().getId();
        Device device = deviceRepository.findByIdAndFactoryId(id, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        device.setName(request.getName());
        Device updatedDevice = deviceRepository.save(device);
        return toDto(updatedDevice);
    }

    public void deleteDevice(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        Long factoryId = user.getFactory().getId();
        Device device = deviceRepository.findByIdAndFactoryId(id, factoryId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        deviceRepository.delete(device);
    }

    private DeviceDto toDto(Device device) {
        return DeviceDto.builder()
                .id(device.getId())
                .name(device.getName())
                .apiKey(device.getApiKey())
                .factoryId(device.getFactory().getId())
                .build();
    }
}