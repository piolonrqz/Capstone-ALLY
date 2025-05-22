package com.wachichaw.User.Repo;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wachichaw.User.Entity.UserEntity;

@Repository
public interface UserRepo extends JpaRepository<UserEntity, Integer>{
    Optional<UserEntity> findByEmail(String email);
  
    boolean existsByEmail(String email);
}