package com.wachichaw.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
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
}

