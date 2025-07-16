package com.wachichaw.EmailConfig.Service;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VerificationService {
    @Autowired
    private EmailService emailService;

    public String generateVerificationPin() {
    int pin = (int)(Math.random() * 900000) + 100000; // Generates a random 6-digit number
    return String.valueOf(pin);
}

    
    public void sendVerificationEmail(String to, String userName, int token) {

        System.out.print(to + token + userName);
        String verificationPin = generateVerificationPin(); 
    
        String subject = "Verify Your Account";
        String body = 
    "<html>" +
    "<head>" +
    "<style>" +
    "body {" +
    "  font-family: Arial, sans-serif;" +
    "  color: #333;" +
    "  line-height: 1.6;" +
    "  background-color: #f8f8f8;" +
    "  margin: 0;" +
    "  padding: 0;" +
    "}" +
    ".email-container {" +
    "  width: 100%;" +
    "  max-width: 600px;" +
    "  margin: 0 auto;" +
    "  padding: 20px;" +
    "  background-color: white;" +
    "  border: 1px solid #ddd;" +
    "  border-radius: 8px;" +
    "}" +
    ".header {" +
    "  background-color: #1a6eff;" +
    "  color: white;" +
    "  text-align: center;" +
    "  padding: 10px;" +
    "  border-radius: 8px 8px 0 0;" +
    "}" +
    ".content {" +
    "  padding: 20px;" +
    "  text-align: center;" +
    "}" +
    ".footer {" +
    "  background-color: #eee;" +
    "  color: #888;" +
    "  padding: 10px;" +
    "  text-align: center;" +
    "  font-size: 12px;" +
    "  border-radius: 0 0 8px 8px;" +
    "}" +
    ".button {" +
    "  display: inline-block;" +
    "  background-color: #1a6eff;" +
    "  color: white;" +
    "  padding: 10px 20px;" +
    "  text-decoration: none;" +
    "  border-radius: 5px;" +
    "  margin-top: 20px;" +
    "}" +
    "</style>" +
    "</head>" +
    "<body>" +
    "<div class=\"email-container\">" +
    "<div class=\"header\">" +
    "<h2>Verify Your Account</h2>" +
    "</div>" +
    "<div class=\"content\">" +
    "<h3>Hi " + userName + ",</h3>" +
    "<p>Here is you're OTP:</p>" +
    "<h1 style=\"color: #1a6eff;\">" + token + "</h1>" +
    "<p>If you did not create this account, please ignore this email.</p>" +
    "</div>" +
    "<div class=\"footer\">" +
    "<p>&copy; " + LocalDate.now().getYear() + " AllyLegal</p>" +
    "</div>" +
    "</div>" +
    "</body>" +
    "</html>";


                      emailService.sendEmail(to, subject, body);
                    }
}
