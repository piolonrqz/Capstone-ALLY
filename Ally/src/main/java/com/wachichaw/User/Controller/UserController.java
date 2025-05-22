package com.wachichaw.User.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Config.JwtUtil;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.User.Entity.LoginRequest;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Repo.UserRepo;
import com.wachichaw.User.Service.UserService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private JwtUtil jwtUtil;
     
   
    @PostMapping("/Client")
    public ClientEntity createClient(@RequestBody ClientEntity client) {
        return userService.createClient(client.getEmail(), client.getPassword(), client.getFname(), client.getLname(), client.getContactInfo(), client.getLocation());
    }

    @PostMapping("/Lawyer")
    public LawyerEntity createLawyer(@RequestBody LawyerEntity lawyer) {
        return userService.createLawyer(lawyer.getEmail(), lawyer.getPassword(), lawyer.getFname(), lawyer.getLname(),lawyer.getSpecialization(), lawyer.getExperience(), lawyer.getCredentials());
    }

    @PostMapping("/login")
    @Operation(summary = "Login a user")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        int id = Integer.parseInt(jwtUtil.extractUserId(token));
        String email = jwtUtil.extractEmail(token);
        String accountType = jwtUtil.extractAccountType(token);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", id);
        response.put("email", email);
        response.put("accountType", accountType);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/getAll")
    public List<UserEntity> getAllUser() {
        return userService.getAllUser();
    }

  

    @DeleteMapping("/deleteUser{userId}")
    public String DeleteUser(@PathVariable int userId){
        return userService.deleteUser(userId);
    }
    

    
}
