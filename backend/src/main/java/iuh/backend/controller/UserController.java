package iuh.backend.controller;

import iuh.backend.model.Factory;
import iuh.backend.model.User;
import iuh.backend.payload.request.CreateUserRequest;
import iuh.backend.payload.request.UpdateUserRequest;
import iuh.backend.payload.response.UserDto;
import iuh.backend.repository.FactoryRepository;
import iuh.backend.repository.UserRepository;
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
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final FactoryRepository factoryRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@AuthenticationPrincipal UserDetails currentUser,
                                              @RequestBody CreateUserRequest request) {
        User adminUser = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Factory factory = adminUser.getFactory();

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
    public ResponseEntity<List<UserDto>> getAllUsers(@AuthenticationPrincipal UserDetails currentUser) {
        User adminUser = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        List<User> users = userRepository.findByFactory(adminUser.getFactory());
        return ResponseEntity.ok(users.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@AuthenticationPrincipal UserDetails currentUser,
                                               @PathVariable Long id) {
        User adminUser = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        User user = userRepository.findById(id)
                .filter(u -> u.getFactory().equals(adminUser.getFactory()))
                .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

        return ResponseEntity.ok(convertToDto(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@AuthenticationPrincipal UserDetails currentUser,
                                              @PathVariable Long id,
                                              @RequestBody UpdateUserRequest request) {
        User adminUser = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        User user = userRepository.findById(id)
                .filter(u -> u.getFactory().equals(adminUser.getFactory()))
                .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getRole() != null) user.setRole(request.getRole());

        userRepository.save(user);
        return ResponseEntity.ok(convertToDto(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal UserDetails currentUser,
                                           @PathVariable Long id) {
        User adminUser = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        User user = userRepository.findById(id)
                .filter(u -> u.getFactory().equals(adminUser.getFactory()))
                .orElseThrow(() -> new RuntimeException("User not found or not in the same factory"));

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
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