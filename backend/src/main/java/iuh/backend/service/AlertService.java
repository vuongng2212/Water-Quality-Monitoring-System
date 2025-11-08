package iuh.backend.service;

import iuh.backend.model.Device;
import iuh.backend.model.EmployeeDeviceAccess;
import iuh.backend.model.User;
import iuh.backend.model.enums.Role;
import iuh.backend.repository.EmployeeDeviceAccessRepository;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final EmployeeDeviceAccessRepository employeeDeviceAccessRepository;

    // Thresholds for water quality parameters
    private static final double PH_MIN = 6.5;
    private static final double PH_MAX = 8.5;
    private static final double TEMPERATURE_MAX = 30.0; // Celsius
    private static final double TURBIDITY_MAX = 5.0; // NTU
    private static final double CONDUCTIVITY_MAX = 1000.0; // µS/cm

    public void checkAndSendAlerts(Device device, double ph, double temperature, double turbidity, double conductivity) {
        String deviceName = device.getName();

        // Check pH
        if (ph < PH_MIN || ph > PH_MAX) {
            sendAlertToAssignedUsers(device, "pH", ph, ph < PH_MIN ? PH_MIN : PH_MAX);
        }

        // Check temperature
        if (temperature > TEMPERATURE_MAX) {
            sendAlertToAssignedUsers(device, "Nhiệt độ", temperature, TEMPERATURE_MAX);
        }

        // Check turbidity
        if (turbidity > TURBIDITY_MAX) {
            sendAlertToAssignedUsers(device, "Độ đục", turbidity, TURBIDITY_MAX);
        }

        // Check conductivity
        if (conductivity > CONDUCTIVITY_MAX) {
            sendAlertToAssignedUsers(device, "Độ dẫn điện", conductivity, CONDUCTIVITY_MAX);
        }
    }

    private void sendAlertToAssignedUsers(Device device, String parameter, double value, double threshold) {
        // Lấy employees được assign thiết bị này
        List<EmployeeDeviceAccess> assignments = employeeDeviceAccessRepository.findByDeviceId(device.getId());
        List<User> assignedEmployees = assignments.stream()
                .map(EmployeeDeviceAccess::getUser)
                .filter(user -> user.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());

        // Lấy tất cả admins của factory
        List<User> admins = userRepository.findByFactoryIdAndRoleIn(device.getFactory().getId(), List.of(Role.ADMIN));

        // Kết hợp employees assigned + admins
        List<User> recipients = new java.util.ArrayList<>();
        recipients.addAll(assignedEmployees);
        recipients.addAll(admins);

        // Loại bỏ duplicates nếu có
        recipients = recipients.stream().distinct().collect(Collectors.toList());

        for (User user : recipients) {
            try {
                emailService.sendAlertEmail(user.getEmail(), device.getName(), parameter, value, threshold);
                System.out.println("Alert email sent to: " + user.getEmail() + " (" + user.getRole() + ") for " + parameter + " = " + value);
            } catch (Exception e) {
                System.err.println("Failed to send alert email to: " + user.getEmail() + " - " + e.getMessage());
            }
        }
    }
}