package iuh.backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDataDto {
    private Long id;
    private Double ph;
    private Double temperature;
    private Double turbidity;
    private Double conductivity;
    private LocalDateTime timestamp;
    private Long deviceId; // Only device ID, no nested object
}