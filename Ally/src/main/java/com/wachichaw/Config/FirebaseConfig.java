package com.wachichaw.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${storage.type:firebase}")
    private String storageType;

    @Value("${firebase.service.account.path}")
    private String serviceAccountPath;

    @Value("${firebase.storage.bucket}")
    private String storageBucket;

    private final Environment env;

    public FirebaseConfig(Environment env) {
        this.env = env;
    }

    @PostConstruct
public void initializeFirebase() {
    try {
        if (!"firebase".equalsIgnoreCase(storageType)) return;

        InputStream serviceAccount;
        if (serviceAccountPath.startsWith("classpath:")) {
            String path = serviceAccountPath.replace("classpath:", "");
            serviceAccount = getClass().getClassLoader().getResourceAsStream(path);
            if (serviceAccount == null) {
                throw new RuntimeException("Firebase JSON not found in classpath: " + path);
            }
        } else {
            String filePath = serviceAccountPath.replace("file:", "");
            File f = new File(filePath);
            if (!f.exists()) {
                throw new RuntimeException("Firebase JSON file does not exist: " + filePath);
            }
            serviceAccount = new FileInputStream(f);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket(storageBucket)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }

    } catch (IOException e) {
        throw new RuntimeException("Failed to initialize Firebase", e);
    }
}

    @Bean
    public FirebaseApp firebaseApp() {
        return FirebaseApp.getInstance();
    }
}