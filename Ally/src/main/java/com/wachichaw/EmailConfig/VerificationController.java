package com.wachichaw.EmailConfig;

import java.nio.file.AccessDeniedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import org.springframework.http.ResponseEntity;
import java.util.Map;

import com.wachichaw.Client.Entity.TempClient;

import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Service.UserService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

import com.wachichaw.EmailConfig.VerificationService;
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
    private UserService userService; // Assume this is your user service

    @PostMapping("/verifyClient")
    public ResponseEntity<?> verifyAccountClient(@RequestParam int token) throws AccessDeniedException {
        System.out.println("Received token: " + token);
        ClientEntity client = tempClientStorageService.getUnverifiedUser(token);
        System.out.println("Client retrieved: " + client.getEmail());
        System.out.println("Client password: " + client.getPassword());
        System.out.println("Client first name: " + client.getFname());
        System.out.println("Client last name: " + client.getLname());   
        System.out.println("Client phone number: " + client.getPhoneNumber());
        System.out.println("Client address: " + client.getAddress());
        System.out.println("Client city: " + client.getCity());
        System.out.println("Client province: " + client.getProvince());
        System.out.println("Client zip: " + client.getZip());
        System.out.println("Client profile photo: " + client.getProfilePhoto());
    
         
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
        client.getProfilePhoto()
        );
        userService.verifyClient(client.getEmail()); 
        tempClientStorageService.removeUnverifiedUser(token);
        return ResponseEntity.ok().body(Map.of("success", true));
            
    }
    @PostMapping("/verifyLawyer")
    public ResponseEntity<?> verifyAccountLawyer(@RequestParam int token) throws AccessDeniedException {
        System.out.println("Received token: " + token);
        LawyerEntity lawyer = tempLawyerStorageService.getUnverifiedUser(token);
        System.out.println("Client retrieved: " + lawyer.getEmail());
        System.out.println("Client password: " + lawyer.getPassword());
        System.out.println("Client first name: " + lawyer.getFname());
        System.out.println("Client last name: " + lawyer.getLname());   
        System.out.println("Client phone number: " + lawyer.getPhoneNumber());
        System.out.println("Client address: " + lawyer.getAddress());
        System.out.println("Client city: " + lawyer.getCity());
        System.out.println("Client province: " + lawyer.getProvince());
        System.out.println("Client zip: " + lawyer.getZip());
        System.out.println("Client profile photo: " + lawyer.getProfilePhoto());
    
         
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
        lawyer.getEducationInstitution()
        );
        userService.verifyLawyer(lawyer.getEmail()); 
        tempClientStorageService.removeUnverifiedUser(token);
        return ResponseEntity.ok().body(Map.of("success", true));
            
    }
}
