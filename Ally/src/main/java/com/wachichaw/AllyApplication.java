package com.wachichaw;

import java.io.FileInputStream;
import java.io.InputStream;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.google.api.client.util.Value;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class AllyApplication {

    @Value("${firebase.service.account.path}")
    private String firebaseServiceAccountPath;

    @PostConstruct
    public void initFirebase() {
        try {
            InputStream serviceAccount;
            if (firebaseServiceAccountPath.startsWith("file:")) {
                // Load from file system path (e.g., Render Secret Files)
                String filePath = firebaseServiceAccountPath.substring("file:".length());
                serviceAccount = new FileInputStream(filePath);
            } else {
                // Load from classpath (e.g., local development)
                String resourcePath = firebaseServiceAccountPath.startsWith("classpath:") 
                                      ? firebaseServiceAccountPath.substring("classpath:".length()) 
                                      : firebaseServiceAccountPath;
                serviceAccount = getClass().getClassLoader().getResourceAsStream(resourcePath);
            }

            if (serviceAccount == null) {
                throw new RuntimeException("Cannot find Firebase service account file at: " + firebaseServiceAccountPath);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }

	public static void main(String[] args) {
		SpringApplication.run(AllyApplication.class, args);
	}

	@Bean
	CommandLineRunner commandLineRunner(ChatClient.Builder builder){
		return args -> {
			var client = builder.build();

			String response = client.prompt("Tell me a joke")
				.call()
				.content();

			System.out.println(response);
		};
	}

}
