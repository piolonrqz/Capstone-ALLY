package com.wachichaw.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.net.HttpURLConnection;
import java.net.URL;

@Configuration
public class KeepAliveConfig {

    private static final String HEALTH_URL = "https://capstone-ally.onrender.com/actuator/health";

    @Scheduled(fixedRate = 4 * 60 * 1000) // every 4 minutes
    public void pingSelf() {
        try {
            URL url = new URL(HEALTH_URL);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            int responseCode = con.getResponseCode();
            System.out.println("Self-ping response: " + responseCode);
        } catch (Exception e) {
            System.out.println("Self-ping failed: " + e.getMessage());
        }
    }
}
