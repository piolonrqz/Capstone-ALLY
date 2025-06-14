package com.wachichaw.Document.Repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wachichaw.Document.Entity.DocumentEntity;

@Repository
public interface DocumentRepo extends JpaRepository<DocumentEntity, Integer>{
    
    // Find documents by case ID
    List<DocumentEntity> findByLegalcaseEntityCaseId(int caseId);
    
    // Count documents for case
    int countByLegalcaseEntityCaseId(int caseId);
    
    // Find documents by client and case
    List<DocumentEntity> findByUploadedByUserIdAndLegalcaseEntityCaseId(int clientId, int caseId);
    
    // Find documents uploaded in date range
    List<DocumentEntity> findByUploadedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find documents by status
    List<DocumentEntity> findByStatus(String status);
    
    // Custom query to find documents for cases assigned to a specific lawyer
    @Query("SELECT d FROM DocumentEntity d WHERE d.legalcaseEntity.lawyer.userId = :lawyerId")
    List<DocumentEntity> findDocumentsByLawyerId(@Param("lawyerId") int lawyerId);
    
    // Custom query to check if user has access to document
    @Query("SELECT COUNT(d) > 0 FROM DocumentEntity d WHERE d.document_id = :documentId AND " +
           "(d.uploadedBy.userId = :userId OR d.legalcaseEntity.lawyer.userId = :userId)")
    boolean hasUserAccessToDocument(@Param("documentId") int documentId, @Param("userId") int userId);
}