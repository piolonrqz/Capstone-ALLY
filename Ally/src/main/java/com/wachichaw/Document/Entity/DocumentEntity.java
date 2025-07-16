package com.wachichaw.Document.Entity;

import java.time.LocalDateTime;


import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.User.Entity.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Document")
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private int document_id;

    @ManyToOne
    @JoinColumn(name = "case_id")
    private LegalCasesEntity legalcaseEntity; 

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private UserEntity uploadedBy;

    @Column(name = "document_name")
    private String documentName;
    
    @Column(name = "file_path")
    private String filePath;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @Column(name = "status")
    private String status;

    public DocumentEntity(int document_id, LegalCasesEntity legalcaseEntity, UserEntity uploadedBy, String documentName, String filePath, String documentType, LocalDateTime uploadedAt, String status) {
        this.document_id = document_id;
        this.legalcaseEntity = legalcaseEntity;
        this.uploadedBy = uploadedBy;
        this.documentName = documentName;
        this.filePath = filePath;
        this.documentType = documentType;
        this.uploadedAt = uploadedAt;
        this.status = status;
    }

    public DocumentEntity() {}

    public int getDocument_id() {
        return document_id;
    }

    public void setDocument_id(int document_id) {
        this.document_id = document_id;
    }

    public LegalCasesEntity getCaseEntity() {
        return legalcaseEntity;
    }

    public void setCaseEntity(LegalCasesEntity legalcaseEntity) {
        this.legalcaseEntity = legalcaseEntity;
    }

    public UserEntity getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(UserEntity uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getStatus(){
        return status;
    }

    public void setStatus(String status){
        this.status = status;
    }
}
