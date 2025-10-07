package iuh.backend.payload.request;

import iuh.backend.model.User;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;
    private String password;
    @Email
    private String email;
    private User.Role role;
}