package com.wachichaw.Client.Entity;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.wachichaw.Client.Entity.ClientEntity;

@Service
public class TempClient{
    private final Map<Integer, ClientEntity> unverifiedUsers = new ConcurrentHashMap<>();

    public void saveUnverifiedUser(int token, ClientEntity user) {
        unverifiedUsers.put(token, user);
    }

    public ClientEntity getUnverifiedUser(int token) {
        ClientEntity user = unverifiedUsers.get(token);
        System.out.println("Retrieved user: " + (user != null ? user.getEmail() : "null"));
        return user;
    }
  

    public void removeUnverifiedUser(int token) {
        unverifiedUsers.remove(token);
    }
}