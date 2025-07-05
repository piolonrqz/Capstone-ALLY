package com.wachichaw.AllyChatAI.Service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiChatService {

    @Value("${google.project-id}")
    private String projectId;

    @Value("${google.model-id}")
    private String modelId;

    private final GoogleCredentials googleCredentials;

    public GeminiChatService(GoogleCredentials googleCredentials) throws IOException {
        this.googleCredentials = googleCredentials
            .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
        this.googleCredentials.refreshIfExpired();
    }

    public String sendMessage(String prompt) {
        try {
            String token = googleCredentials.getAccessToken().getTokenValue();

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestBody = """
                {
                  "contents": [
                    {
                      "role": "user",
                      "parts": [{ "text": "%s" }]
                    }
                  ]
                }
            """.formatted(prompt);

            String endpoint = String.format(
                "https://us-central1-aiplatform.googleapis.com/v1/projects/%s/locations/us-central1/endpoints/%s:generateContent",
                projectId, modelId
            );

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}