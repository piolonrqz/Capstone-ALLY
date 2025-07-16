package com.wachichaw.EmailConfig.Controller;

import java.nio.file.AccessDeniedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.integration.IntegrationProperties.RSocket.Client;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;

import java.util.Map;
import java.util.Optional;

import com.wachichaw.Client.Entity.TempClient;

import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Service.UserService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

import com.wachichaw.EmailConfig.Service.VerificationService;
import com.wachichaw.Lawyer.Controller.LawyerController;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Entity.TempLawyer;

@RestController
public class VerificationController {
    @SuppressWarnings("unused")
    private final VerificationService verificationService;
    @Autowired
    private TempClient tempClientStorageService;
    @Autowired
    private TempLawyer tempLawyerStorageService;

    
    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @Autowired
    private UserService userService; 

    @PostMapping("/resendCodeClient")
    public ResponseEntity<String> resendCodeClient(@RequestParam String email) {
        int token = tempClientStorageService.getTokenByEmail(email);
        ClientEntity client = tempClientStorageService.getUnverifiedUser(token);
        userService.createClient(
        client.getEmail(),
        client.getPassword(),
        client.getFname(),
        client.getLname(),
        client.getPhoneNumber(),
        client.getAddress(),
        client.getCity(),
        client.getProvince(),
        client.getZip(),
        client.getProfilePhotoUrl()
        );
        tempClientStorageService.removeUnverifiedUser(token);
        return ResponseEntity.ok("Code Resent Successfully");
    }
    @PostMapping("/resendCodeLawyer")
    public ResponseEntity<String> resendCodeLawyer(@RequestParam String email) {
        int token = tempLawyerStorageService.getTokenByEmail(email);
         LawyerEntity lawyer = tempLawyerStorageService.getUnverifiedUser(token); 
        userService.createLawyer(
        lawyer.getEmail(),
        lawyer.getPassword(),
        lawyer.getFname(),
        lawyer.getLname(),
        lawyer.getPhoneNumber(),
        lawyer.getAddress(),
        lawyer.getCity(),
        lawyer.getProvince(),
        lawyer.getZip(),
        lawyer.getBarNumber(),
        lawyer.getSpecialization(),
        lawyer.getExperience(),
        lawyer.getCredentials(),
        lawyer.getEducationInstitution(),
        lawyer.getProfilePhotoUrl()
        );
        tempClientStorageService.removeUnverifiedUser(token);
        return ResponseEntity.ok("Code Resent Successfully");
    }

    @PostMapping("/verifyClient")
    public ResponseEntity<?> verifyAccountClient(@RequestParam int token) throws AccessDeniedException {
        System.out.println("Received token: " + token);
        ClientEntity client = tempClientStorageService.getUnverifiedUser(token);
        userService.saveClient(
        client.getEmail(),
        client.getPassword(),
        client.getFname(),
        client.getLname(),
        client.getPhoneNumber(),
        client.getAddress(),
        client.getCity(),
        client.getProvince(),
        client.getZip(),
        client.getProfilePhotoUrl()
        );
        userService.verifyClient(client.getEmail()); 
        tempClientStorageService.removeUnverifiedUser(token);
        return ResponseEntity.ok().body(Map.of("success", true));
            
    }
    @PostMapping("/verifyLawyer")
    public ResponseEntity<?> verifyAccountLawyer(@RequestParam int token) throws AccessDeniedException {
        System.out.println("Received token: " + token);
        LawyerEntity lawyer = tempLawyerStorageService.getUnverifiedUser(token);
        
    
         
        userService.saveLawyer(
        lawyer.getEmail(),
        lawyer.getPassword(),
        lawyer.getFname(),
        lawyer.getLname(),
        lawyer.getPhoneNumber(),
        lawyer.getAddress(),
        lawyer.getCity(),
        lawyer.getProvince(),
        lawyer.getZip(),
        lawyer.getBarNumber(),
        lawyer.getSpecialization(),
        lawyer.getExperience(),
        lawyer.getCredentials(),
        lawyer.getEducationInstitution(),
        lawyer.getProfilePhotoUrl()

        );
        userService.verifyLawyer(lawyer.getEmail()); 
        tempClientStorageService.removeUnverifiedUser(token);
        return ResponseEntity.ok().body(Map.of("success", true));
            
    }
}
