package iuh.backend.repository;

import iuh.backend.model.DeviceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceSettingsRepository extends JpaRepository<DeviceSettings, Long> {
    Optional<DeviceSettings> findByDeviceId(Long deviceId);
}