package com.wachichaw.Case.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wachichaw.Case.Entity.LegalCasesEntity;

@Repository
public interface LegalCaseRepo extends JpaRepository<LegalCasesEntity, Integer>{
   
    List<LegalCasesEntity> findByClientUserId(int clientId);
    
    List<LegalCasesEntity> findByLawyerUserId(int lawyerId);
    
    @Query("SELECT MAX(c.caseNumber) FROM LegalCasesEntity c")
    Optional<Long> findMaxCaseNumber();
}
