package com.wachichaw.EmailConfig;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service


public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        if (!StringUtils.hasText(to) || !StringUtils.hasText(subject) || !StringUtils.hasText(body)) {
            throw new IllegalArgumentException("Email to, subject, and body must not be empty");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);  // true means multipart

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // Set the body as HTML

            
            // You might want to set a from address
            helper.setFrom("allylegal.cit@gmail.com"); // or another valid email

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (MessagingException e) {
            System.out.println("Error sending email to: " + to + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    public void sendAppointmentReminder(String to, String userName, java.time.LocalDateTime appointmentTime, String userType) {
        String subject = "Appointment Reminder";
        String body = "<html>" +
                "<body>" +
                "<h3>Hi " + userName + ",</h3>" +
                "<p>This is a reminder for your upcoming appointment on " + appointmentTime.toLocalDate() + " at " + appointmentTime.toLocalTime() + ".</p>" +
                "<p>Thank you,</p>" +
                "<p>Ally Team</p>" +
                "</body>" +
                "</html>";
        sendEmail(to, subject, body);
    }
}
