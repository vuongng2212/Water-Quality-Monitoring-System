package iuh.backend.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValveControlRequest {
    @NotNull(message = "Trạng thái van không được null")
    private Boolean open;
}