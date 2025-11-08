package iuh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Filter;

@Entity
@Table(name = "device_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceSettings {

    @Id
    private Long id;

    @Column(name = "is_valve_open")
    private boolean isValveOpen;

    @Column(name = "is_collecting_data")
    private boolean isCollectingData;

    @Column(name = "data_interval_seconds")
    private int dataIntervalSeconds;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Device device;
}