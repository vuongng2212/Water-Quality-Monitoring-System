package iuh.backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeviceSettingsDto {
    private boolean isValveOpen;
    private boolean isCollectingData;
    private int dataIntervalSeconds;
}