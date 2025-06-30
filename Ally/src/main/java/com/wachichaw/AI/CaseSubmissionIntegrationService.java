package com.wachichaw.AI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wachichaw.AI.Entity.LawyerRecommendationRequest;
import com.wachichaw.AI.Entity.LawyerRecommendationResponse;
import com.wachichaw.AI.Service.LawyerRecommendationService;
import com.wachichaw.Case.Entity.CaseStatus;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Entity.UrgencyLevel;
import com.wachichaw.Case.Service.LegalCaseService;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Integration service that handles the workflow from case submission 
 * to automatic lawyer recommendation (Transaction 4.1 → Transaction 3.3)
 */
@Service
@Transactional
public class CaseSubmissionIntegrationService {
    
    @Autowired
    private LegalCaseService legalCaseService;
    
    @Autowired
    private LawyerRecommendationService recommendationService;
    
    @Autowired
    private ClientRepo clientRepo;
    
    /**
     * Complete workflow: Submit case and get lawyer recommendations
     * This method should be called after Transaction 4.1 (Submit Legal Case)
     */
    public CaseSubmissionResult submitCaseAndGetRecommendations(CaseSubmissionRequest request) {
        try {
            // Step 1: Create and save the legal case using the existing service method
            LegalCasesEntity savedCase = legalCaseService.createLegalCase(
                request.getClientId().intValue(), // Convert Long to int
                null, // No lawyer assigned yet
                request.getTitle(),
                request.getDescription(),
                LocalDateTime.now(),
                CaseStatus.PENDING
            );
            
            // Step 2: Update additional fields that createLegalCase doesn't handle
            savedCase.setCaseType(request.getCaseType());
            savedCase.setUrgencyLevel(request.getUrgencyLevel());
            
            // Step 3: Create recommendation request based on the case
            LawyerRecommendationRequest recommendationRequest = createRecommendationRequest(savedCase);
            
            // Step 4: Get lawyer recommendations using AI
            List<LawyerRecommendationResponse> recommendations = 
                recommendationService.recommendLawyers(recommendationRequest);
            
            // Step 5: Return combined result
            return new CaseSubmissionResult(savedCase, recommendations, true, "Case submitted and recommendations generated successfully");
            
        } catch (Exception e) {
            e.printStackTrace();
            return new CaseSubmissionResult(null, null, false, "Error: " + e.getMessage());
        }
    }
    
    /**
     * Get fresh recommendations for an existing case
     */
    public List<LawyerRecommendationResponse> getRecommendationsForCase(Long caseId) {
        try {
            // Find the case by ID (you'll need to add this method to LegalCaseService)
            LegalCasesEntity legalCase = legalCaseService.findById(caseId.intValue());
            if (legalCase == null) {
                throw new RuntimeException("Case not found with ID: " + caseId);
            }
            
            LawyerRecommendationRequest request = createRecommendationRequest(legalCase);
            return recommendationService.recommendLawyers(request);
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get recommendations for case: " + e.getMessage());
        }
    }
    
    // /**
    //  * Helper method to find case by ID (you should add this to LegalCaseService)
    //  */
    // private LegalCasesEntity findCaseById(int caseId) {
    //     // This is a temporary implementation - you should add this method to LegalCaseService
    //     // For now, we'll throw an exception to indicate this needs to be implemented
    //     throw new RuntimeException("findCaseById method needs to be implemented in LegalCaseService");
    // }
    
    private LawyerRecommendationRequest createRecommendationRequest(LegalCasesEntity legalCase) {
        LawyerRecommendationRequest request = new LawyerRecommendationRequest();
        request.setCaseType(legalCase.getCaseType());
        if (legalCase.getUrgencyLevel() != null) {
            request.setUrgencyLevel(legalCase.getUrgencyLevel().toString());
        }
        // Add more fields based on your LawyerRecommendationRequest requirements
        
        return request;
    }
    
    // DTOs for the integration service
    public static class CaseSubmissionRequest {
        private String title;
        private String caseType;
        private String description;
        private UrgencyLevel urgencyLevel;
        private Long clientId;
        
        // Constructors
        public CaseSubmissionRequest() {}
        
        public CaseSubmissionRequest(String title, String caseType, String description, 
                                   UrgencyLevel urgencyLevel, Long clientId) {
            this.title = title;
            this.caseType = caseType;
            this.description = description;
            this.urgencyLevel = urgencyLevel;
            this.clientId = clientId;
        }
        
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getCaseType() { return caseType; }
        public void setCaseType(String caseType) { this.caseType = caseType; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public UrgencyLevel getUrgencyLevel() { return urgencyLevel; }
        public void setUrgencyLevel(UrgencyLevel urgencyLevel) { this.urgencyLevel = urgencyLevel; }
        
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
    }
    
    public static class CaseSubmissionResult {
        private LegalCasesEntity submittedCase;
        private List<LawyerRecommendationResponse> recommendations;
        private boolean success;
        private String message;
        
        public CaseSubmissionResult(LegalCasesEntity submittedCase, 
                                  List<LawyerRecommendationResponse> recommendations,
                                  boolean success, String message) {
            this.submittedCase = submittedCase;
            this.recommendations = recommendations;
            this.success = success;
            this.message = message;
        }
        
        // Getters and Setters
        public LegalCasesEntity getSubmittedCase() { return submittedCase; }
        public void setSubmittedCase(LegalCasesEntity submittedCase) { this.submittedCase = submittedCase; }
        
        public List<LawyerRecommendationResponse> getRecommendations() { return recommendations; }
        public void setRecommendations(List<LawyerRecommendationResponse> recommendations) { 
            this.recommendations = recommendations; 
        }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}