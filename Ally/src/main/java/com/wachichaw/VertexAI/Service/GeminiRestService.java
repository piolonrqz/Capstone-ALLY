package com.wachichaw.VertexAI.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.google.auth.oauth2.GoogleCredentials;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@Service
public class GeminiRestService {
    
    private final RestTemplate restTemplate;
    
    @Value("${vertex.ai.project-id}")
    private String projectId;
    
    @Value("${vertex.ai.location}")
    private String location;
    
    @Value("${vertex.ai.model.endpoint}")
    private String modelEndpoint;

    @Value("classpath:service-account-key.json")
    private Resource serviceAccountKey;
    
    public GeminiRestService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public String generateContentViaRest(String prompt) {
        try {
            // Get access token
            String accessToken = getAccessToken();
            
            // Build request URL
            String url = String.format(
                "https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/endpoints/%s:predict",
                location, projectId, location, modelEndpoint
            );
            
            // Build request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            // Build request body for Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> instances = new HashMap<>();
            instances.put("prompt", prompt);
            requestBody.put("instances", Collections.singletonList(instances));
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            return extractTextFromResponse(response.getBody());
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling Vertex AI REST API: " + e.getMessage(), e);
        }
    }
    
    private String getAccessToken() throws IOException {
        try (InputStream inputStream = serviceAccountKey.getInputStream()) {
            GoogleCredentials credentials = GoogleCredentials
                .fromStream(inputStream)
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/cloud-platform"));
            credentials.refreshIfExpired();
            return credentials.getAccessToken().getTokenValue();
        }
    }
    
    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            // Extract text from the response based on Vertex AI response format
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
            if (predictions != null && !predictions.isEmpty()) {
                Map<String, Object> firstPrediction = predictions.get(0);
                return (String) firstPrediction.get("content");
            }
            return "No response generated";
        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage();
        }
    }
}