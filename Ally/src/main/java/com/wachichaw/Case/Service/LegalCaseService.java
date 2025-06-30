package com.wachichaw.Case.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wachichaw.Case.Entity.CaseStatus;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Entity.LegalCaseResponseDTO;
import com.wachichaw.Case.Repo.LegalCaseRepo;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.User.Repo.UserRepo;


@Service
public class LegalCaseService {
        
    @Autowired
    private ClientRepo clientRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private final LegalCaseRepo legalCaseRepo;

    public LegalCaseService(LegalCaseRepo legalCaseRepo) {
        this.legalCaseRepo = legalCaseRepo;
    }
    
    public LegalCasesEntity createLegalCase(int clientId, LawyerEntity lawyer, String title, String caseType, String caseDescription, LocalDateTime caseDate, CaseStatus status) {
        ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
        
        // Auto-generate sequential case number
        Long nextCaseNumber = generateNextCaseNumber();
        
        // Default to PENDING if no status is provided
        if (status == null) {
            status = CaseStatus.PENDING;
        }
        
        LegalCasesEntity legalCase = new LegalCasesEntity();
        legalCase.setClient(client);
        legalCase.setLawyer(lawyer);
        legalCase.setTitle(title);
        legalCase.setCaseType(caseType);
        legalCase.setCaseNumber(nextCaseNumber);
        legalCase.setDescription(caseDescription);
        legalCase.setDateSubmitted(caseDate);
        legalCase.setStatus(status);
        return legalCaseRepo.save(legalCase);
    }
    
    private Long generateNextCaseNumber() {
        // Get the maximum case number and increment by 1
        // If no cases exist, start with 1
        return legalCaseRepo.findMaxCaseNumber()
                .map(maxNumber -> maxNumber + 1)
                .orElse(1L);
    }    public List<LegalCasesEntity> getCasesByClientId(int clientId) {
        return legalCaseRepo.findByClientUserId(clientId);
    }

    public List<LegalCasesEntity> getCasesByLawyerId(int lawyerId) {
        return legalCaseRepo.findByLawyerUserId(lawyerId);
    }

    // New methods that return DTOs with full lawyer/client information
    public List<LegalCaseResponseDTO> getCasesByClientIdWithDetails(int clientId) {
        List<LegalCasesEntity> cases = legalCaseRepo.findByClientUserId(clientId);
        return cases.stream()
                .map(LegalCaseResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<LegalCaseResponseDTO> getCasesByLawyerIdWithDetails(int lawyerId) {
        List<LegalCasesEntity> cases = legalCaseRepo.findByLawyerUserId(lawyerId);
        return cases.stream()
                .map(LegalCaseResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public LegalCasesEntity updateCaseStatus(int caseId, CaseStatus status) {
        LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with ID: " + caseId));
        legalCase.setStatus(status);
        return legalCaseRepo.save(legalCase);
    }

    public LegalCasesEntity acceptCase(int caseId, int lawyerIdPerformingAction) {
        LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with ID: " + caseId));

        // Authorization check
        if (legalCase.getLawyer() == null || legalCase.getLawyer().getUserId() != lawyerIdPerformingAction) {
            throw new RuntimeException("Lawyer " + lawyerIdPerformingAction + " is not authorized to accept case " + caseId);
        }

        legalCase.setStatus(CaseStatus.ACCEPTED);
        return legalCaseRepo.save(legalCase);
    }

    public LegalCasesEntity declineCase(int caseId, int lawyerIdPerformingAction) {
        LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with ID: " + caseId));

        // Authorization check
        if (legalCase.getLawyer() == null || legalCase.getLawyer().getUserId() != lawyerIdPerformingAction) {
            throw new RuntimeException("Lawyer " + lawyerIdPerformingAction + " is not authorized to decline case " + caseId);
        }

        legalCase.setStatus(CaseStatus.DECLINED);
        return legalCaseRepo.save(legalCase);
    }

    // Weka 

    // Find a legal case by its ID
    public LegalCasesEntity findById(int caseId) {
        return legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with ID: " + caseId));
    }

    // Find a legal case by its ID (Long version for compatibility)
    public LegalCasesEntity findById(Long caseId) {
        return findById(caseId.intValue());
    }

    // Save or update a legal case
    public LegalCasesEntity save(LegalCasesEntity legalCase) {
        return legalCaseRepo.save(legalCase);
    }

    // Get all legal cases
    public List<LegalCasesEntity> findAll() {
        return legalCaseRepo.findAll();
    }

    // Check if a case exists by ID
    public boolean existsById(int caseId) {
        return legalCaseRepo.existsById(caseId);
    }
}
