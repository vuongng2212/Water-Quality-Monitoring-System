package iuh.backend.payload.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceDto {
    private Long id;
    private String name;
    private String apiKey;
    private Long factoryId;
    private List<UserDto> assignedUsers;
    private DeviceSettingsDto settings;
}