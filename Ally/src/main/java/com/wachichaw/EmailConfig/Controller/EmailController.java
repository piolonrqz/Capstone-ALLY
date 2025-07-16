package com.wachichaw.EmailConfig.Controller;

import com.wachichaw.EmailConfig.EmailRequest;
import com.wachichaw.EmailConfig.Service.EmailService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }
    
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")  // Add security check
    public ResponseEntity<String> sendEmail(@Valid @RequestBody EmailRequest emailRequest) {
        System.out.println("Received email request: " + emailRequest);
        
        try {
            emailService.sendEmail(emailRequest.getTo(), emailRequest.getSubject(), emailRequest.getBody());
            return ResponseEntity.ok("Email sent successfully!");
        } catch (RuntimeException e) {
            System.out.println("Error while sending email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to send email: " + e.getMessage());
        }
    }
}