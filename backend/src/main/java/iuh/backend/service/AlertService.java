package iuh.backend.service;

import iuh.backend.model.Device;
import iuh.backend.model.EmployeeDeviceAccess;
import iuh.backend.model.User;
import iuh.backend.model.enums.Role;
import iuh.backend.repository.EmployeeDeviceAccessRepository;
import iuh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final EmployeeDeviceAccessRepository employeeDeviceAccessRepository;

    // Thresholds for water quality parameters
    private static final double PH_MIN = 5.5;
    private static final double PH_MAX = 9.0;
    private static final double TEMPERATURE_MAX = 40.0; // Celsius
    private static final double TURBIDITY_MAX = 50.0; // NTU
    private static final double TDS_MAX = 1000.0; // mg/l

    // Alert cooldown - không gửi alert cùng loại trong 30 phút
    private static final int ALERT_COOLDOWN_MINUTES = 30;

    // Track last alert time cho mỗi device và parameter
    private final Map<String, LocalDateTime> lastAlertTimes = new HashMap<>();

    public void checkAndSendAlerts(Device device, double ph, double temperature, double turbidity, double tds) {
        String deviceName = device.getName();

        // Check pH
        if (ph < PH_MIN || ph > PH_MAX) {
            String alertKey = device.getId() + "-ph";
            if (shouldSendAlert(alertKey)) {
                sendAlertToAssignedUsers(device, "pH", ph, ph < PH_MIN ? PH_MIN : PH_MAX);
                updateLastAlertTime(alertKey);
            }
        }

        // Check temperature
        if (temperature > TEMPERATURE_MAX) {
            String alertKey = device.getId() + "-temperature";
            if (shouldSendAlert(alertKey)) {
                sendAlertToAssignedUsers(device, "Nhiệt độ", temperature, TEMPERATURE_MAX);
                updateLastAlertTime(alertKey);
            }
        }

        // Check turbidity
        if (turbidity > TURBIDITY_MAX) {
            String alertKey = device.getId() + "-turbidity";
            if (shouldSendAlert(alertKey)) {
                sendAlertToAssignedUsers(device, "Độ đục", turbidity, TURBIDITY_MAX);
                updateLastAlertTime(alertKey);
            }
        }

        // Check TDS
        if (tds > TDS_MAX) {
            String alertKey = device.getId() + "-tds";
            if (shouldSendAlert(alertKey)) {
                sendAlertToAssignedUsers(device, "Tổng chất rắn hòa tan", tds, TDS_MAX);
                updateLastAlertTime(alertKey);
            }
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

    private boolean shouldSendAlert(String alertKey) {
        LocalDateTime lastAlert = lastAlertTimes.get(alertKey);
        if (lastAlert == null) {
            return true; // Chưa từng gửi alert cho parameter này
        }

        long minutesSinceLastAlert = ChronoUnit.MINUTES.between(lastAlert, LocalDateTime.now());
        return minutesSinceLastAlert >= ALERT_COOLDOWN_MINUTES;
    }

    private void updateLastAlertTime(String alertKey) {
        lastAlertTimes.put(alertKey, LocalDateTime.now());
    }
}