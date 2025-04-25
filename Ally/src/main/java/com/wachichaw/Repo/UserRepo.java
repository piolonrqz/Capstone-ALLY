package com.wachichaw.Repo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wachichaw.Entity.UserEntity;

@Repository
public interface UserRepo extends JpaRepository<UserEntity, Integer>{
    UserEntity findByEmail(String email);
  
    boolean existsByEmail(String email);
}