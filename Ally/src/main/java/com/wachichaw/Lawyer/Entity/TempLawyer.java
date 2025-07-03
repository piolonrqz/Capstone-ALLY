package com.wachichaw.Lawyer.Entity;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.wachichaw.Lawyer.Entity.LawyerEntity;

@Service
public class TempLawyer{
    private final Map<Integer, LawyerEntity> unverifiedUsers = new ConcurrentHashMap<>();

    public void saveUnverifiedUser(int token, LawyerEntity user) {
        unverifiedUsers.put(token, user);
    }

    public LawyerEntity getUnverifiedUser(int token) {
        LawyerEntity user = unverifiedUsers.get(token);
        System.out.println("Retrieved user: " + (user != null ? user.getEmail() : "null"));
        return user;
    }
  

    public void removeUnverifiedUser(int token) {
        unverifiedUsers.remove(token);
    }
}