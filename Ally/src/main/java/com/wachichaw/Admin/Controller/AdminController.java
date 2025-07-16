package com.wachichaw.Admin.Controller;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import com.wachichaw.Admin.Service.AdminService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/admins")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private JwtUtil jwtUtil;



    @PutMapping("/lawyers/verify/{id}")
    public ResponseEntity<?> verifyLawyer(@PathVariable int id) {
    adminService.verifyLawyer(id); // toggles or sets is_verified = true
    return ResponseEntity.ok("Lawyer verified.");
}

    @PutMapping("/lawyers/reject/{id}")
    public ResponseEntity<?> rejectLawyer(@PathVariable int id) {
        adminService.rejectLawyer(id); // sets credentials to null
        return ResponseEntity.ok("Lawyer rejected.");
    }
          
}
