package com.wachichaw.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Component;

import com.wachichaw.User.Entity.UserEntity;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
    // Use a secure, base64-encoded secret key string in production!
    private static final String SECRET = "ReplaceThisWithASecretKeyOfAtLeast32Characters!";
    private SecretKey secretKey = Keys.hmacShaKeyFor(SECRET.getBytes()); // Generates a secure key
    private long expirationTime = 1000 * 60 * 60; // 1 hour

    // Generate token for UserEntity without role attribute
    public String generateToken(UserEntity user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("accountType", user.getAccountType());
        return createToken(claims, String.valueOf(user.getUserId()));
    }

 
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey)
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractUsername(String token) {
        return (String) extractAllClaims(token).get("username");
    }
    public String extractEmail(String token) {
        return (String) extractAllClaims(token).get("email");
    }
    public String extractAccountType(String token) {
        return (String) extractAllClaims(token).get("accountType");
    }
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token, String userId) {
        final String extractedUserId = extractUserId(token);
        return (extractedUserId.equals(userId) && !isTokenExpired(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
