package com.wachichaw.Admin.Service;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.wachichaw.Admin.Repo.AdminRepo;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Config.JwtUtil;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Repo.UserRepo;

@Service
public class AdminService {
    
    @Autowired
    private final AdminRepo adminRepo;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private LawyerRepo lawyerRepo;


    public AdminService(AdminRepo adminRepo,PasswordEncoder passwordEncoder) {
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public LawyerEntity verifyLawyer(int id) {
    LawyerEntity lawyer = lawyerRepo.findById(id)
    .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + id));
        lawyer.setCredentialsVerified(true);
        return lawyerRepo.save(lawyer);
    }

    public LawyerEntity rejectLawyer(int id) {
        LawyerEntity lawyer = lawyerRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + id));
        lawyer.setCredentials(null);
        return lawyerRepo.save(lawyer);
    }
     
}
