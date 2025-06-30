package com.wachichaw.AI.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wachichaw.AI.Entity.LawyerRecommendationRequest;
import com.wachichaw.AI.Entity.LawyerRecommendationResponse;
import com.wachichaw.AI.Service.LawyerRecommendationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lawyer-recommendation")
@CrossOrigin(origins = "*")
public class LawyerRecommendationController {
    
    @Autowired
    private LawyerRecommendationService recommendationService;
    
    /**
     * Get lawyer recommendations based on case requirements
     * This endpoint implements Transaction 3.3: Match Via AI
     */
    @PostMapping("/recommend")
    public ResponseEntity<?> recommendLawyers(@Valid @RequestBody LawyerRecommendationRequest request) {
        try {
            List<LawyerRecommendationResponse> recommendations = recommendationService.recommendLawyers(request);
            
            if (recommendations.isEmpty()) {
                return ResponseEntity.ok().body(new ApiResponse(
                    true, 
                    "No lawyers found matching your criteria", 
                    recommendations
                ));
            }
            
            return ResponseEntity.ok().body(new ApiResponse(
                true, 
                "Lawyer recommendations generated successfully", 
                recommendations
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(
                    false, 
                    "Error generating recommendations: " + e.getMessage(), 
                    null
                ));
        }
    }
    
    /**
     * Retrain the ML model with latest data
     * This should be called periodically or when significant new data is added
     */
    @PostMapping("/retrain")
    public ResponseEntity<?> retrainModel() {
        try {
            recommendationService.trainModel();
            return ResponseEntity.ok().body(new ApiResponse(
                true, 
                "Model retrained successfully", 
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(
                    false, 
                    "Error retraining model: " + e.getMessage(), 
                    null
                ));
        }
    }
    
    /**
     * Get model information and statistics
     */
    @GetMapping("/model-info")
    public ResponseEntity<?> getModelInfo() {
        try {
            ModelInfo info = recommendationService.getModelInfo();
            return ResponseEntity.ok().body(new ApiResponse(
                true, 
                "Model information retrieved successfully", 
                info
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(
                    false, 
                    "Error retrieving model information: " + e.getMessage(), 
                    null
                ));
        }
    }
    
    /**
     * Test endpoint to validate model is working
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            boolean isHealthy = recommendationService.isModelReady();
            return ResponseEntity.ok().body(new ApiResponse(
                true, 
                isHealthy ? "Recommendation service is healthy" : "Recommendation service needs attention", 
                new HealthStatus(isHealthy)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(
                    false, 
                    "Health check failed: " + e.getMessage(), 
                    new HealthStatus(false)
                ));
        }
    }
    
    // Inner classes for API responses
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
    
    public static class ModelInfo {
        private String modelType;
        private int trainingDataSize;
        private String lastTrained;
        private double accuracy;
        
        public ModelInfo(String modelType, int trainingDataSize, String lastTrained, double accuracy) {
            this.modelType = modelType;
            this.trainingDataSize = trainingDataSize;
            this.lastTrained = lastTrained;
            this.accuracy = accuracy;
        }
        
        // Getters and Setters
        public String getModelType() { return modelType; }
        public void setModelType(String modelType) { this.modelType = modelType; }
        
        public int getTrainingDataSize() { return trainingDataSize; }
        public void setTrainingDataSize(int trainingDataSize) { this.trainingDataSize = trainingDataSize; }
        
        public String getLastTrained() { return lastTrained; }
        public void setLastTrained(String lastTrained) { this.lastTrained = lastTrained; }
        
        public double getAccuracy() { return accuracy; }
        public void setAccuracy(double accuracy) { this.accuracy = accuracy; }
    }
    
    public static class HealthStatus {
        private boolean healthy;
        private long timestamp;
        
        public HealthStatus(boolean healthy) {
            this.healthy = healthy;
            this.timestamp = System.currentTimeMillis();
        }
        
        // Getters and Setters
        public boolean isHealthy() { return healthy; }
        public void setHealthy(boolean healthy) { this.healthy = healthy; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}