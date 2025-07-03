package com.wachichaw.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vertexai.VertexAI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

@Configuration
public class VertexAIConfig {

    @Value("${vertex.ai.project-id}")
    private String projectId;

    @Value("${vertex.ai.location}")
    private String location;

    @Value("classpath:service-account-key.json")
    private Resource serviceAccountKey;

    @Bean
    public GoogleCredentials googleCredentials() throws IOException {
        try (InputStream inputStream = serviceAccountKey.getInputStream()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(inputStream)
                .createScoped(Collections.singletonList("https://www.googleapis.com/auth/cloud-platform"));
            credentials.refreshIfExpired();
            return credentials;
        }
    }

    @Bean
    public VertexAI vertexAI(GoogleCredentials credentials) throws IOException {
        return new VertexAI.Builder()
            .setProjectId(projectId)
            .setLocation(location)
            .setCredentials(credentials)
            .build();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}