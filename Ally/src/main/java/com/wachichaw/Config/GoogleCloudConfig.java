package com.wachichaw.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.io.IOException;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class GoogleCloudConfig {
    @Bean
    public GoogleCredentials googleCredentials() throws IOException {
        return GoogleCredentials
            .fromStream(new ClassPathResource("service-account-key.json").getInputStream())
            .createScoped("https://www.googleapis.com/auth/cloud-platform");
    }

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000);
        factory.setReadTimeout(30000);
        return new RestTemplate(factory);
    }
}

