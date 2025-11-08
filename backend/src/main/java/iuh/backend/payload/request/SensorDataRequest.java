package iuh.backend.payload.request;

import iuh.backend.payload.response.DeviceSettingsDto;
import lombok.Data;

@Data
public class SensorDataRequest {
    private double ph;
    private double temperature;
    private double turbidity;
    private double conductivity;

    // Optional: current device settings sent by device
    private DeviceSettingsDto currentSettings;
}