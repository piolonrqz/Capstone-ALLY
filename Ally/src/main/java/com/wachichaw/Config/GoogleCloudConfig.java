package com.wachichaw.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

@Configuration
public class GoogleCloudConfig {
  @Value("${google.service.account.path}")
private String serviceAccountPath;

@Bean
public GoogleCredentials googleCredentials() throws IOException {
    Resource resource;

    if (serviceAccountPath.startsWith("file:")) {
        resource = new FileSystemResource(serviceAccountPath.substring(5));
    } else {
        resource = new ClassPathResource(
            serviceAccountPath.replace("classpath:", "")
        );
    }

    return GoogleCredentials
            .fromStream(resource.getInputStream())
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

