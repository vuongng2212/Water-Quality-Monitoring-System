package iuh.backend.controller;
import iuh.backend.config.TenantContext;

import iuh.backend.model.Factory;
import iuh.backend.model.User;
import iuh.backend.payload.request.CreateUserRequest;
import iuh.backend.payload.request.ChangePasswordRequest;
import iuh.backend.payload.request.UpdateUserRequest;
import iuh.backend.payload.response.UserDto;
import iuh.backend.repository.FactoryRepository;
import iuh.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs cho quản lý người dùng")
public class UserController {

    private final UserRepository userRepository;
    private final FactoryRepository factoryRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo người dùng mới", description = "Tạo một người dùng mới trong nhà máy của admin")
    public ResponseEntity<UserDto> createUser(@AuthenticationPrincipal UserDetails currentUser,
                                               @RequestBody CreateUserRequest request) {
        Long factoryId = TenantContext.getTenantId();
        if (factoryId == null) {
            throw new RuntimeException("Factory ID not found in tenant context");
        }
        Factory factory = factoryRepository.findById(factoryId)
                .orElseThrow(() -> new RuntimeException("Factory not found with ID: " + factoryId));

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(request.getRole())
                .factory(factory)
                .build();

        userRepository.save(newUser);
        return new ResponseEntity<>(convertToDto(newUser), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách người dùng", description = "Lấy danh sách tất cả người dùng trong nhà máy")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Lấy thông tin người dùng", description = "Lấy thông tin chi tiết một người dùng")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        Long factoryId = TenantContext.getTenantId();
        try {
            User user = userRepository.findByIdAndFactoryId(id, factoryId)
                    .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));
            return ResponseEntity.ok(convertToDto(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật người dùng", description = "Cập nhật thông tin người dùng")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id,
                                              @RequestBody UpdateUserRequest request,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        Long factoryId = TenantContext.getTenantId();
        System.out.println("Update user - id: " + id + ", factoryId: " + factoryId + ", currentUser: " + userDetails.getUsername() + ", authorities: " + userDetails.getAuthorities());
        try {
            User user = userRepository.findByIdAndFactoryId(id, factoryId)
                    .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));
            System.out.println("Found user: " + user.getUsername() + ", factory: " + user.getFactory().getId());

            // Check if the current user is updating their own profile or is admin
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isOwnProfile = user.getUsername().equals(userDetails.getUsername());
            System.out.println("isAdmin: " + isAdmin + ", isOwnProfile: " + isOwnProfile);

            if (!isAdmin && !isOwnProfile) {
                System.out.println("Forbidden: not admin and not own profile");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Non-admin users can only update their own email and username
            if (!isAdmin && isOwnProfile) {
                if (request.getUsername() != null) user.setUsername(request.getUsername());
                if (request.getEmail() != null) user.setEmail(request.getEmail());
                // Cannot change password or role
                System.out.println("Updating own profile: username=" + request.getUsername() + ", email=" + request.getEmail());
            } else {
                // Admin can update everything
                if (request.getUsername() != null) user.setUsername(request.getUsername());
                if (request.getEmail() != null) user.setEmail(request.getEmail());
                if (request.getPassword() != null && !request.getPassword().isEmpty()) user.setPassword(passwordEncoder.encode(request.getPassword()));
                if (request.getRole() != null) user.setRole(request.getRole());
                System.out.println("Admin updating user");
            }

            userRepository.save(user);
            return ResponseEntity.ok(convertToDto(user));
        } catch (RuntimeException e) {
            System.out.println("Exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{id}/password")
    @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu cho người dùng")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                           @RequestBody ChangePasswordRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        Long factoryId = TenantContext.getTenantId();
        try {
            User user = userRepository.findByIdAndFactoryId(id, factoryId)
                    .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

            // Check if the current user is changing their own password or is admin
            if (!user.getUsername().equals(userDetails.getUsername()) && !userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không đúng");
            }

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa người dùng", description = "Xóa một người dùng")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Long factoryId = TenantContext.getTenantId();
        try {
            User user = userRepository.findByIdAndFactoryId(id, factoryId)
                    .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

            userRepository.delete(user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .factoryId(user.getFactory().getId())
                .build();
    }
}