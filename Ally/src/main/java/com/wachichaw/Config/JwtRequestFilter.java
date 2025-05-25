package com.wachichaw.Config;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Repo.UserRepo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private final JwtUtil jwtUtil;

    @Autowired
    private UserRepo userRepo;

    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            final String authorizationHeader = request.getHeader("Authorization");
            System.out.println("Servlet path: " + request.getServletPath());

            if (request.getServletPath().equals("/users/login")) {
            chain.doFilter(request, response);
             return;
        }   

            // Process JWT token if present
            String userId = null;
            String jwt = null;
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                try {
                    userId = jwtUtil.extractUserId(jwt);
                    logger.debug("User ID extracted from JWT: {}", userId);
                } catch (Exception e) {
                    logger.error("Invalid JWT token: {}", e.getMessage());
                }
            }
                        System.out.println(jwt); 

            // Authenticate user if token is valid
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    Optional<UserEntity> userEntityOptional = userRepo.findById(Integer.valueOf(userId));

                    if (userEntityOptional.isPresent() && jwtUtil.validateToken(jwt, userId)) {
                        UserEntity userEntity = userEntityOptional.get();
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userEntity, null, Collections.emptyList());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("User authenticated: {}", userId);
                    } else {
                        logger.debug("Invalid JWT token or user not found");
                    }
                } catch (NumberFormatException e) {
                    logger.error("Error parsing user ID: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("JWT Authentication error: {}", e.getMessage());
        }

        chain.doFilter(request, response);
        return;
    }
}
