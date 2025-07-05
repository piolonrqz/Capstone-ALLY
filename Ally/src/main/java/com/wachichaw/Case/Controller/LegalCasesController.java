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
import com.wachichaw.Case.Entity.LegalCaseResponseDTO;
import com.wachichaw.Case.Service.LegalCaseService;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Service.LawyerService;
import com.wachichaw.User.Repo.UserRepo;

@RestController
@RequestMapping("/Cases")
public class LegalCasesController {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private final LegalCaseService LegalCaseService;
    @Autowired
    private LawyerService lawyerservice;

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
            request.getCaseType(),
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
    public ResponseEntity<List<LegalCaseResponseDTO>> getClientCases(@PathVariable int clientId) {
        try {
            List<LegalCaseResponseDTO> cases = LegalCaseService.getCasesByClientIdWithDetails(clientId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }    
    
    @GetMapping("/lawyer/{lawyerId}")
    public ResponseEntity<List<LegalCaseResponseDTO>> getLawyerCases(@PathVariable int lawyerId) {
        try {
            List<LegalCaseResponseDTO> cases = LegalCaseService.getCasesByLawyerIdWithDetails(lawyerId);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{caseId}/status")
    public ResponseEntity<LegalCasesEntity> updateCaseStatus(@PathVariable int caseId, @RequestBody CaseStatus status) {
        return updateStatus(caseId, status);
    }    
    
    @PutMapping("/{caseId}/accept/{lawyerId}")
    public ResponseEntity<LegalCasesEntity> acceptCase(@PathVariable int caseId, @PathVariable int lawyerId) {
        try {
            // The service method LegalCaseService.acceptCase now contains the refined logic
            LegalCasesEntity updatedCase = LegalCaseService.acceptCase(caseId, lawyerId);
            return ResponseEntity.ok(updatedCase);
        } catch (RuntimeException e) { // Catch specific exceptions if preferred
            e.printStackTrace(); // Or log more appropriately
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Or a proper error DTO
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{caseId}/decline/{lawyerId}")
    public ResponseEntity<LegalCasesEntity> declineCase(@PathVariable int caseId, @PathVariable int lawyerId) {
        try {
            LegalCasesEntity updatedCase = LegalCaseService.declineCase(caseId, lawyerId); // Calling the new service method
            return ResponseEntity.ok(updatedCase);
        } catch (RuntimeException e) { // Catch specific exceptions if preferred
            e.printStackTrace(); // Or log more appropriately
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Or a proper error DTO
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

    @PutMapping("/{caseId}/complete/{lawyerId}")
    public ResponseEntity<LegalCasesEntity> completeCase(@PathVariable int caseId, @PathVariable int lawyerId) {
        try {
            ResponseEntity updatedCase = updateCaseStatus(caseId, CaseStatus.COMPLETED);
            if (updatedCase.getStatusCode() == HttpStatus.OK) {
                // Increment the cases handled for the lawyer
                ResponseEntity<LawyerEntity> lawyerUpdateResponse = lawyerservice.updateCasesHandled(lawyerId);
                if (lawyerUpdateResponse.getStatusCode() != HttpStatus.OK) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
                return updatedCase; // Return the updated case response
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
}
