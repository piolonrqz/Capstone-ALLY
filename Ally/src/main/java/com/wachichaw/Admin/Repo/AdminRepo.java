package com.wachichaw.Admin.Repo;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wachichaw.Admin.Entity.AdminEntity;
@Repository
public interface AdminRepo extends JpaRepository<AdminEntity, Integer>{
    Optional<AdminEntity> findByEmail(String email);
  
    boolean existsByEmail(String email);
}