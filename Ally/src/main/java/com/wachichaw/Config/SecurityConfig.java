package com.wachichaw.Config;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;

@Configuration
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oauthLogin;

    public SecurityConfig(OAuth2LoginSuccessHandler oauthLogin) {
                this.oauthLogin = oauthLogin;
        }

    @Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)) // <-- Change this!
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers(
                "/api-docs/**",
                "/swagger-ui/**",
                "/api-docs/**",
                "/swagger-resources/**",
                "/swagger-ui.html",
                "/users/Client",
                "/users/Lawyer",
                "/users/login",
                "/users/**",
                "/login/oauth2/code/google",
                "/error", "/login**", "/oauth2/**"
            ).permitAll()
            .anyRequest().permitAll())
        .oauth2Login(oauth2 -> oauth2
            .successHandler(oauthLogin)
            .userInfoEndpoint(userInfo -> userInfo.oidcUserService(oidcUserService())))
        .httpBasic(Customizer.withDefaults());

    return http.build();
}
     @Bean
        public OidcUserService oidcUserService() {
            return new OidcUserService();
        }
     @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Specify allowed origins
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allowed HTTP methods
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // For all paths
        source.registerCorsConfiguration("/uploads/**", configuration); 
        source.registerCorsConfiguration("/profile_pictures/**", configuration);

        return new CorsFilter(source);
    }
}
