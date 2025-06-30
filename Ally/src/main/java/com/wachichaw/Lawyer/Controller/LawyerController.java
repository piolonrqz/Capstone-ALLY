package com.wachichaw.Lawyer.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(LawyerController.class);

    @Autowired
    private LawyerRepo lawyerRepository;

    @GetMapping("/unverified")
    public ResponseEntity<List<LawyerEntity>> getUnverifiedLawyers() {
        logger.info("Fetching unverified lawyers...");
        List<LawyerEntity> unverifiedLawyers = lawyerRepository.findByCredentialsVerified(false);
        logger.info("Found {} unverified lawyers", unverifiedLawyers.size());
        return ResponseEntity.ok(unverifiedLawyers);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<LawyerEntity>> getVerifiedLawyers() {
        logger.info("Fetching verified lawyers...");
        List<LawyerEntity> verifiedLawyers = lawyerRepository.findByCredentialsVerified(true);
        logger.info("Found {} verified lawyers", verifiedLawyers.size());
        return ResponseEntity.ok(verifiedLawyers);
    }
}
