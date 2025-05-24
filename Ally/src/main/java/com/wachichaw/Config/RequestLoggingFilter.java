package com.wachichaw.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);

        // Proceed with the filter chain
        filterChain.doFilter(wrappedRequest, response);

        // Only log for POST/PUT/PATCH requests
        if ("POST".equalsIgnoreCase(request.getMethod()) ||
            "PUT".equalsIgnoreCase(request.getMethod()) ||
            "PATCH".equalsIgnoreCase(request.getMethod())) {

            byte[] buf = wrappedRequest.getContentAsByteArray();
            if (buf.length > 0) {
                String body = new String(buf, 0, buf.length, StandardCharsets.UTF_8);
                System.out.println("Raw Request Body: " + body);
            } else {
                System.out.println("Raw Request Body: <empty>");
            }
        }
    }
}