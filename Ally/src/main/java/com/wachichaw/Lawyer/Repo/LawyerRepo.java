package com.wachichaw.Lawyer.Repo;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wachichaw.Lawyer.Entity.LawyerEntity;

@Repository
public interface LawyerRepo extends JpaRepository<LawyerEntity, Integer>{
    boolean existsByEmail(String email);
    List<LawyerEntity> findByCredentialsVerified(Boolean credentialsVerified);

}
