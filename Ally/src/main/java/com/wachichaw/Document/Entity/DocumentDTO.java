package com.wachichaw.Document.Entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Data Transfer Object for Document API responses
 * Provides a clean interface without exposing internal entity relationships
 */
public class DocumentDTO {
    
    @JsonProperty("documentId")
    private int documentId;
    
    @JsonProperty("caseId")
    private int caseId;
    
    @JsonProperty("caseTitle")
    private String caseTitle;
    
    @JsonProperty("uploadedById")
    private int uploadedById;
    
    @JsonProperty("uploaderName")
    private String uploaderName;
    
    @JsonProperty("uploaderRole")
    private String uploaderRole;
    
    @JsonProperty("documentName")
    private String documentName;
    
    @JsonProperty("documentType")
    private String documentType;
    
    @JsonProperty("uploadedAt")
    private LocalDateTime uploadedAt;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("fileSizeReadable")
    private String fileSizeReadable;

    // Default constructor
    public DocumentDTO() {}

    // Constructor from DocumentEntity
    public DocumentDTO(DocumentEntity document) {
        this.documentId = document.getDocument_id();
        this.caseId = document.getCaseEntity().getCaseId();
        this.caseTitle = document.getCaseEntity().getTitle();
        this.uploadedById = document.getUploadedBy().getUserId();
        this.uploaderName = document.getUploadedBy().getFname() + " " + document.getUploadedBy().getLname();
        this.uploaderRole = document.getUploadedBy().getAccountType().toString();
        this.documentName = document.getDocumentName();
        this.documentType = document.getDocumentType();
        this.uploadedAt = document.getUploadedAt();
        this.status = document.getStatus();
        this.fileSizeReadable = "N/A"; // Can be calculated if needed
    }

    // Getters and Setters
    public int getDocumentId() {
        return documentId;
    }

    public void setDocumentId(int documentId) {
        this.documentId = documentId;
    }

    public int getCaseId() {
        return caseId;
    }

    public void setCaseId(int caseId) {
        this.caseId = caseId;
    }

    public String getCaseTitle() {
        return caseTitle;
    }

    public void setCaseTitle(String caseTitle) {
        this.caseTitle = caseTitle;
    }

    public int getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(int uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploaderName() {
        return uploaderName;
    }

    public void setUploaderName(String uploaderName) {
        this.uploaderName = uploaderName;
    }

    public String getUploaderRole() {
        return uploaderRole;
    }

    public void setUploaderRole(String uploaderRole) {
        this.uploaderRole = uploaderRole;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFileSizeReadable() {
        return fileSizeReadable;
    }

    public void setFileSizeReadable(String fileSizeReadable) {
        this.fileSizeReadable = fileSizeReadable;
    }
}