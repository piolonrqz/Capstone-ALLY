package com.wachichaw.Lawyer.Controller;

import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
