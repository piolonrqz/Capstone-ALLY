package com.wachichaw.Document.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wachichaw.Document.Entity.DocumentEntity;



@Repository
public interface DocumentRepo extends JpaRepository<DocumentEntity, Integer>{
  
}