package iuh.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendAlertEmail(String to, String deviceName, String parameter, double value, double threshold) {
        String subject = "Cảnh báo chất lượng nước - " + deviceName;
        String body = String.format(
            "Cảnh báo từ thiết bị: %s\n\n" +
            "Thông số: %s\n" +
            "Giá trị hiện tại: %.2f\n" +
            "Ngưỡng cho phép: %.2f\n\n" +
            "Vui lòng kiểm tra và xử lý kịp thời.",
            deviceName, parameter, value, threshold
        );
        sendEmail(to, subject, body);
    }
}