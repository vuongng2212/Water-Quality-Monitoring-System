package iuh.backend.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DataIntervalRequest {
    @NotNull(message = "Khoảng thời gian không được null")
    @Min(value = 1, message = "Khoảng thời gian phải lớn hơn 0")
    private Integer interval;
}