package iuh.backend.repository;

import iuh.backend.model.EmployeeDeviceAccess;
import iuh.backend.model.EmployeeDeviceAccessId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeDeviceAccessRepository extends JpaRepository<EmployeeDeviceAccess, EmployeeDeviceAccessId> {
    boolean existsById(EmployeeDeviceAccessId id);
    
    List<EmployeeDeviceAccess> findByUserId(Long userId);
    
    List<EmployeeDeviceAccess> findByDeviceId(Long deviceId);
    
    void deleteByUserIdAndDeviceId(Long userId, Long deviceId);
}