package com.wachichaw.VertexAI.Service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerationConfig;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Collections;

@Service
public class GeminiService {
    
    private final VertexAI vertexAI;
    private final RestTemplate restTemplate;
    private final GoogleCredentials credentials;
    
    @Value("${vertex.ai.model.name}")
    private String modelName;
    
    @Value("${vertex.ai.model.endpoint}")
    private String modelEndpoint;
    
    public GeminiService(VertexAI vertexAI, RestTemplate restTemplate, GoogleCredentials credentials) {
        this.vertexAI = vertexAI;
        this.restTemplate = restTemplate;
        this.credentials = credentials;
    }
    
    public String generateContent(String prompt) {
        try {
            return generateContentViaEndpoint(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Error generating content: " + e.getMessage(), e);
        }
    }

    public String generateContentWithConfig(String prompt, GenerationConfig config) {
        try {
            // For fine-tuned models, config might need to be passed differently
            return generateContentViaEndpoint(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Error generating content with config: " + e.getMessage(), e);
        }
    }

    private String generateContentViaEndpoint(String prompt) {
        try {
            // Get access token
            credentials.refreshIfExpired();
            String accessToken = credentials.getAccessToken().getTokenValue();
            
            // Build request URL for endpoint prediction
            String url = String.format(
                "https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/endpoints/%s:predict",
                vertexAI.getLocation(), vertexAI.getProjectId(), vertexAI.getLocation(), modelEndpoint
            );
            
            // Build request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            // Build request body for fine-tuned Gemini model
            Map<String, Object> requestBody = new HashMap<>();
            
            // For Gemini models, the input format should be:
            Map<String, Object> instance = new HashMap<>();
            instance.put("prompt", prompt);
            
            requestBody.put("instances", Collections.singletonList(instance));
            
            // Optional parameters
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", 0.7);
            parameters.put("maxOutputTokens", 1024);
            parameters.put("topP", 0.8);
            requestBody.put("parameters", parameters);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            return extractTextFromResponse(response.getBody());
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling fine-tuned model endpoint: " + e.getMessage(), e);
        }
    }
    
    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
            if (predictions != null && !predictions.isEmpty()) {
                Map<String, Object> firstPrediction = predictions.get(0);
                
                // Try different possible response formats
                if (firstPrediction.containsKey("content")) {
                    return (String) firstPrediction.get("content");
                } else if (firstPrediction.containsKey("text")) {
                    return (String) firstPrediction.get("text");
                } else if (firstPrediction.containsKey("generated_text")) {
                    return (String) firstPrediction.get("generated_text");
                } else {
                    // Return the whole prediction if we can't find the expected field
                    return firstPrediction.toString();
                }
            }
            return "No response generated";
        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage() + " - Raw response: " + response.toString();
        }
    }
}