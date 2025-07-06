package com.wachichaw.AllyChatAI.Service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.auth.oauth2.GoogleCredentials;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.*;

import java.io.IOException;
import java.util.*;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiChatService {

    @Value("${google.project-id}")
    private String projectId;

    @Value("${google.model-id}")
    private String modelId;

    private final GoogleCredentials googleCredentials;
    private final List<ObjectNode> conversationHistory = new ArrayList<>();

    private final ObjectMapper mapper = new ObjectMapper();

    public GeminiChatService(GoogleCredentials googleCredentials) throws IOException {
        this.googleCredentials = googleCredentials
                .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
        this.googleCredentials.refreshIfExpired();
    }

    public String sendMessage(String prompt) {
        try {
            // Add user message to history
            ObjectNode userNode = mapper.createObjectNode();
            userNode.put("role", "user");
            ArrayNode userParts = mapper.createArrayNode();
            userParts.addObject().put("text", prompt);
            userNode.set("parts", userParts);
            conversationHistory.add(userNode);

            // Build request body
            ObjectNode requestBody = mapper.createObjectNode();
            ArrayNode contentsNode = mapper.createArrayNode();
            for (ObjectNode msg : conversationHistory) {
                contentsNode.add(msg);
            }
            requestBody.set("contents", contentsNode);

            // Auth headers
            String token = googleCredentials.getAccessToken().getTokenValue();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

            String endpoint = String.format(
                "https://us-central1-aiplatform.googleapis.com/v1/projects/%s/locations/us-central1/endpoints/%s:generateContent",
                projectId, modelId
            );

            // Send request
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

            // Optional: Add model response to history
            String modelResponseText = extractTextFromResponse(response.getBody());

            ObjectNode modelNode = mapper.createObjectNode();
            modelNode.put("role", "model");
            ArrayNode modelParts = mapper.createArrayNode();
            modelParts.addObject().put("text", modelResponseText);
            modelNode.set("parts", modelParts);
            conversationHistory.add(modelNode);

            return modelResponseText;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String extractTextFromResponse(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "No response text found.";
    }

    // Reset conversation history
    public void resetHistory() {
        conversationHistory.clear();
    }
}
