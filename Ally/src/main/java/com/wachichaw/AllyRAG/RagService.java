package com.wachichaw.AllyRAG;

import com.wachichaw.AllyRAG.RagSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class RagService {

    @Value("${rag.service.url:http://localhost:8000}")
    private String ragServiceUrl;

    private final RestTemplate restTemplate;

    public RagService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public RagSearchResponse searchRelevantCases(String query, int topK) {
        try {
            String url = ragServiceUrl + "/search";

            Map<String, Object> request = new HashMap<>();
            request.put("query", query);
            request.put("top_k", topK);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<RagSearchResponse> response = restTemplate.postForEntity(
                url, entity, RagSearchResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            return new RagSearchResponse();

        } catch (Exception e) {
            System.err.println("RAG service error: " + e.getMessage());
            return new RagSearchResponse();
        }
    }

    public boolean isRagServiceHealthy() {
        try {
            String healthUrl = ragServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}