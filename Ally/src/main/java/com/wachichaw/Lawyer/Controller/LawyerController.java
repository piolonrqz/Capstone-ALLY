package com.wachichaw.Lawyer.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Service.LawyerService;
import com.wachichaw.User.Repo.UserRepo;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import com.wachichaw.User.Entity.AccountType;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/lawyers")
public class LawyerController {

    @Autowired
    private LawyerRepo lawyerRepository;

    @GetMapping("/unverified")
    public ResponseEntity<List<LawyerEntity>> getUnverifiedLawyers() {
        List<LawyerEntity> unverifiedLawyers = lawyerRepository.findByCredentialsVerified(false);
        return ResponseEntity.ok(unverifiedLawyers);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<LawyerEntity>> getVerifiedLawyers() {
        List<LawyerEntity> verifiedLawyers = lawyerRepository.findByCredentialsVerified(true);
        return ResponseEntity.ok(verifiedLawyers);
    }
}
