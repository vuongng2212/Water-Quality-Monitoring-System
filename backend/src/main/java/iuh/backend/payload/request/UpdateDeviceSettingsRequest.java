package iuh.backend.payload.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDeviceSettingsRequest {
    private boolean isValveOpen;
    private boolean isCollectingData;

    @Min(value = 1, message = "Data interval must be at least 1 second")
    private int dataIntervalSeconds;
}