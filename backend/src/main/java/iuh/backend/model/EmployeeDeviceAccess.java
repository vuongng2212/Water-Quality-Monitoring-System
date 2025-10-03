package iuh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employee_device_access")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDeviceAccess {

    @EmbeddedId
    private EmployeeDeviceAccessId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("deviceId")
    @JoinColumn(name = "device_id")
    private Device device;
}