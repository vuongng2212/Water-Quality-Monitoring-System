package iuh.backend.service;

import iuh.backend.model.Device;
import iuh.backend.model.User;
import iuh.backend.model.enums.Role;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final EmailService emailService;
    private final UserRepository userRepository;

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
            sendAlertToUsers(device, "pH", ph, ph < PH_MIN ? PH_MIN : PH_MAX);
        }

        // Check temperature
        if (temperature > TEMPERATURE_MAX) {
            sendAlertToUsers(device, "Nhiệt độ", temperature, TEMPERATURE_MAX);
        }

        // Check turbidity
        if (turbidity > TURBIDITY_MAX) {
            sendAlertToUsers(device, "Độ đục", turbidity, TURBIDITY_MAX);
        }

        // Check conductivity
        if (conductivity > CONDUCTIVITY_MAX) {
            sendAlertToUsers(device, "Độ dẫn điện", conductivity, CONDUCTIVITY_MAX);
        }
    }

    private void sendAlertToUsers(Device device, String parameter, double value, double threshold) {
        List<User> users = userRepository.findByFactoryIdAndRoleIn(device.getFactory().getId(), List.of(Role.ADMIN, Role.EMPLOYEE));

        for (User user : users) {
            try {
                emailService.sendAlertEmail(user.getEmail(), device.getName(), parameter, value, threshold);
                System.out.println("Alert email sent to: " + user.getEmail() + " for " + parameter + " = " + value);
            } catch (Exception e) {
                System.err.println("Failed to send alert email to: " + user.getEmail() + " - " + e.getMessage());
            }
        }
    }
}