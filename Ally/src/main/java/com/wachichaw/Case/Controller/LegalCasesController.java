package com.wachichaw.Case.Controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.wachichaw.Case.Entity.CaseStatus;
import com.wachichaw.Case.Entity.LegalCaseRequestDTO;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Service.LegalCaseService;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.User.Repo.UserRepo;

@RestController
@RequestMapping("/Cases")
public class LegalCasesController {

    @Autowired
    private UserRepo userRepo;
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
            .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + request.getLawyerId()));        LegalCasesEntity legalCase = LegalCaseService.createLegalCase(
            clientId,
            lawyer,
            request.getTitle(),
            request.getDescription(),
            LocalDateTime.now(),
            request.getStatus()
        );

        return ResponseEntity.ok(legalCase);

    } catch (Exception e) {
    e.printStackTrace(); // This will print the error to your console/logs
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
}    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<LegalCasesEntity>> getClientCases(@PathVariable int clientId) {
        try {
            List<LegalCasesEntity> cases = LegalCaseService.getCasesByClientId(clientId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/lawyer/{lawyerId}")
    public ResponseEntity<List<LegalCasesEntity>> getLawyerCases(@PathVariable int lawyerId) {
        try {
            List<LegalCasesEntity> cases = LegalCaseService.getCasesByLawyerId(lawyerId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }    @PutMapping("/{caseId}/status")
    public ResponseEntity<LegalCasesEntity> updateCaseStatus(@PathVariable int caseId, @RequestBody CaseStatus status) {
        return updateStatus(caseId, status);
    }

    @PutMapping("/{caseId}/accept")
    public ResponseEntity<LegalCasesEntity> acceptCase(@PathVariable int caseId) {
        return updateStatus(caseId, CaseStatus.ACCEPTED);
    }

    @PutMapping("/{caseId}/decline")
    public ResponseEntity<LegalCasesEntity> declineCase(@PathVariable int caseId) {
        return updateStatus(caseId, CaseStatus.DECLINED);
    }

    // Helper method to eliminate code duplication
    private ResponseEntity<LegalCasesEntity> updateStatus(int caseId, CaseStatus status) {
        try {
            LegalCasesEntity updatedCase = LegalCaseService.updateCaseStatus(caseId, status);
            return ResponseEntity.ok(updatedCase);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    
}
