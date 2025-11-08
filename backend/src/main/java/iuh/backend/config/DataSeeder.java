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
            // Create Factory A
            Factory factoryA = new Factory();
            factoryA.setName("Factory A");
            factoryA.setAddress("123 Main St, City A");
            factoryRepository.save(factoryA);

            // Create ADMIN for Factory A
            User adminA = new User();
            adminA.setUsername("adminA");
            adminA.setPassword(passwordEncoder.encode("admin"));
            adminA.setEmail("adminA@example.com");
            adminA.setRole(Role.ADMIN);
            adminA.setFactory(factoryA);
            userRepository.save(adminA);

            // Create EMPLOYEE for Factory A
            User employeeA = new User();
            employeeA.setUsername("employeeA");
            employeeA.setPassword(passwordEncoder.encode("employee"));
            employeeA.setEmail("employeeA@example.com");
            employeeA.setRole(Role.EMPLOYEE);
            employeeA.setFactory(factoryA);
            userRepository.save(employeeA);

            // Create Factory B
            Factory factoryB = new Factory();
            factoryB.setName("Factory B");
            factoryB.setAddress("456 Oak Ave, City B");
            factoryRepository.save(factoryB);

            // Create ADMIN for Factory B
            User adminB = new User();
            adminB.setUsername("adminB");
            adminB.setPassword(passwordEncoder.encode("admin"));
            adminB.setEmail("adminB@example.com");
            adminB.setRole(Role.ADMIN);
            adminB.setFactory(factoryB);
            userRepository.save(adminB);

            // Create EMPLOYEE for Factory B
            User employeeB = new User();
            employeeB.setUsername("employeeB");
            employeeB.setPassword(passwordEncoder.encode("employee"));
            employeeB.setEmail("employeeB@example.com");
            employeeB.setRole(Role.EMPLOYEE);
            employeeB.setFactory(factoryB);
            userRepository.save(employeeB);

            System.out.println("=========================================");
            System.out.println("Sample multi-tenant data has been seeded.");
            System.out.println("Factory A Admin: adminA / admin");
            System.out.println("Factory A Employee: employeeA / employee");
            System.out.println("Factory B Admin: adminB / admin");
            System.out.println("Factory B Employee: employeeB / employee");
            System.out.println("=========================================");
        }
    }
}