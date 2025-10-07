package iuh.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDeviceRequest {
    @NotBlank
    private String name;
}