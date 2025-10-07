package iuh.backend.repository;

import iuh.backend.model.SensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    Page<SensorData> findByDeviceId(Long deviceId, Pageable pageable);
}