package iuh.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDeviceAccessId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "device_id")
    private Long deviceId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmployeeDeviceAccessId that = (EmployeeDeviceAccessId) o;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(deviceId, that.deviceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, deviceId);
    }
}