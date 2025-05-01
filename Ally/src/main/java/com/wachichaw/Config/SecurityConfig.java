package com.wachichaw.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui./index.html"
                ).permitAll() // ✅ Allow Swagger access without auth
                .anyRequest().authenticated() // Require auth for other endpoints
            )
            .httpBasic(Customizer.withDefaults()) // Basic auth for protected endpoints
            .csrf(csrf -> csrf.disable()); // Disable CSRF if you're not using forms

        return http.build();
    }
}
