package com.wachichaw.Case.Repo;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wachichaw.Case.Entity.LegalCasesEntity;

@Repository
public interface LegalCaseRepo extends JpaRepository<LegalCasesEntity, Integer>{
   
}
