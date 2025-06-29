package com.wachichaw.AI.Controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wachichaw.AI.CaseSubmissionIntegrationService;
import com.wachichaw.AI.CaseSubmissionIntegrationService.CaseSubmissionRequest;
import com.wachichaw.AI.CaseSubmissionIntegrationService.CaseSubmissionResult;
import com.wachichaw.AI.Entity.LawyerRecommendationResponse;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/case-management")
@CrossOrigin(origins = "*")
public class IntegratedCaseController {
    
    @Autowired
    private CaseSubmissionIntegrationService integrationService;
    
    /**
     * Submit a case and automatically get lawyer recommendations
     * Combines Transaction 4.1 (Submit Legal Case) and Transaction 3.3 (Match Via AI)
     */
    @PostMapping("/submit-with-recommendations")
    public ResponseEntity<?> submitCaseWithRecommendations(@Valid @RequestBody CaseSubmissionRequest request) {
        try {
            CaseSubmissionResult result = integrationService.submitCaseAndGetRecommendations(request);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok().body(new ApiResponse(
                    true,
                    result.getMessage(),
                    result
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(
                    false,
                    result.getMessage(),
                    null
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(
                false,
                "Error processing case submission: " + e.getMessage(),
                null
            ));
        }
    }
    
    /**
     * Get fresh lawyer recommendations for an existing case
     * Implements Transaction 3.3 (Match Via AI) for existing cases
     */
    @GetMapping("/case/{caseId}/recommendations")
    public ResponseEntity<?> getRecommendationsForCase(@PathVariable Long caseId) {
        try {
            List<LawyerRecommendationResponse> recommendations = 
                integrationService.getRecommendationsForCase(caseId);
            
            return ResponseEntity.ok().body(new ApiResponse(
                true,
                "Recommendations retrieved successfully",
                recommendations
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(
                false,
                "Error retrieving recommendations: " + e.getMessage(),
                null
            ));
        }
    }
    
    /**
     * Refresh recommendations for a case (useful when lawyer data changes)
     */
    @PostMapping("/case/{caseId}/refresh-recommendations")
    public ResponseEntity<?> refreshRecommendations(@PathVariable Long caseId) {
        try {
            List<LawyerRecommendationResponse> recommendations = 
                integrationService.getRecommendationsForCase(caseId);
            
            return ResponseEntity.ok().body(new ApiResponse(
                true,
                "Recommendations refreshed successfully",
                new RecommendationRefreshResult(caseId, recommendations, System.currentTimeMillis())
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(
                false,
                "Error refreshing recommendations: " + e.getMessage(),
                null
            ));
        }
    }
    
    // Response DTOs
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;
        
        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
    
    public static class RecommendationRefreshResult {
        private Long caseId;
        private List<LawyerRecommendationResponse> recommendations;
        private long refreshTimestamp;
        
        public RecommendationRefreshResult(Long caseId, List<LawyerRecommendationResponse> recommendations, long refreshTimestamp) {
            this.caseId = caseId;
            this.recommendations = recommendations;
            this.refreshTimestamp = refreshTimestamp;
        }
        
        // Getters and Setters
        public Long getCaseId() { return caseId; }
        public void setCaseId(Long caseId) { this.caseId = caseId; }
        
        public List<LawyerRecommendationResponse> getRecommendations() { return recommendations; }
        public void setRecommendations(List<LawyerRecommendationResponse> recommendations) {
            this.recommendations = recommendations;
        }
        
        public long getRefreshTimestamp() { return refreshTimestamp; }
        public void setRefreshTimestamp(long refreshTimestamp) { this.refreshTimestamp = refreshTimestamp; }
    }
}
