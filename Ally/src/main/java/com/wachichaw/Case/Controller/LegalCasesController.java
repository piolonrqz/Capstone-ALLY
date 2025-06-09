package com.wachichaw.Case.Controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wachichaw.Case.Entity.LegalCaseRequestDTO;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Repo.LegalCaseRepo;
import com.wachichaw.Case.Service.LegalCaseService;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import com.wachichaw.User.Repo.UserRepo;

@RestController
@RequestMapping("/Cases")
public class LegalCasesController {


   
    @Autowired
    private LawyerRepo lawyerRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private LegalCaseRepo legalCaseRepo;
    @Autowired
    private final LegalCaseService LegalCaseService;

    public LegalCasesController(LegalCaseService legalCaseService) {
        this.LegalCaseService = legalCaseService;
    }

    @PostMapping("/create/{clientId}")
    public ResponseEntity<LegalCasesEntity> createLegalCase(@PathVariable int clientId, 
                                                            @RequestBody LegalCaseRequestDTO request
                                                            ) {

          try {

            int lawyerId = request.getLawyerId();
            System.out.println("Lawyer ID: " + lawyerId);
        
        LawyerEntity lawyer = (LawyerEntity) userRepo.findById(request.getLawyerId())
            .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + request.getLawyerId()));

        LegalCasesEntity legalCase = LegalCaseService.createLegalCase(
            clientId,
            lawyer,
            request.getTitle(),
            request.getCaseNumber(),
            request.getDescription(),
            LocalDateTime.now(),
            request.getStatus()
        );

        return ResponseEntity.ok(legalCase);

    } catch (Exception e) {
    e.printStackTrace(); // This will print the error to your console/logs
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
}
    }


    
}
