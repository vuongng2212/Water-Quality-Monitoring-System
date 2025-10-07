package iuh.backend.payload.request;

import lombok.Data;

@Data
public class SensorDataRequest {
    private double ph;
    private double temperature;
    private double turbidity;
    private double conductivity;
}