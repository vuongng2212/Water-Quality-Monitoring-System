package iuh.backend.config;

import iuh.backend.model.Factory;
import iuh.backend.model.User;
import iuh.backend.model.enums.Role;
import iuh.backend.repository.FactoryRepository;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FactoryRepository factoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (factoryRepository.count() == 0) {
            // Create a new factory
            Factory factory = new Factory();
            factory.setName("Sample Factory");
            factory.setAddress("123 Sample Street");
            factoryRepository.save(factory);

            // Create an ADMIN user
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setEmail("admin@example.com");
            admin.setRole(User.Role.ADMIN);
            admin.setFactory(factory);
            userRepository.save(admin);

            // Create an EMPLOYEE user
            User employee = new User();
            employee.setUsername("employee");
            employee.setPassword(passwordEncoder.encode("employee"));
            employee.setEmail("employee@example.com");
            employee.setRole(User.Role.EMPLOYEE);
            employee.setFactory(factory);
            userRepository.save(employee);

            System.out.println("=========================================");
            System.out.println("Sample data has been seeded.");
            System.out.println("ADMIN user: admin / admin");
            System.out.println("EMPLOYEE user: employee / employee");
            System.out.println("=========================================");
        }
    }
}