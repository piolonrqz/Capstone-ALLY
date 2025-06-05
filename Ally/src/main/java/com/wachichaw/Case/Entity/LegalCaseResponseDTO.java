package com.wachichaw.Case.Entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Lawyer.Entity.LawyerEntity;

public class LegalCaseResponseDTO {
    private int caseId;
    private String title;
    private long caseNumber;
    private String description;
    private LocalDateTime dateSubmitted;
    private CaseStatus status;
    private LawyerInfo lawyer;
    private ClientInfo client;
    private int appointmentCount = 0; // Default to 0, can be set if needed
      // Inner classes for lawyer and client info
    public static class LawyerInfo {
        private int userId;
        private String Fname;
        private String Lname;
        private String email;
        private String fee;
        
        public LawyerInfo() {}
        
        public LawyerInfo(LawyerEntity lawyer) {
            if (lawyer != null) {
                this.userId = lawyer.getUserId();
                this.Fname = lawyer.getFname();
                this.Lname = lawyer.getLname();
                this.email = lawyer.getEmail();
                this.fee = "Consultation Fee Available"; // Default fee text
            }        }        // Getters and setters with explicit JSON property names
        public int getUserId() { return userId; }
        public void setUserId(int userId) { this.userId = userId; }
        
        @JsonProperty("Fname")
        public String getFname() { return Fname; }
        public void setFname(String fname) { this.Fname = fname; }
        
        @JsonProperty("Lname")
        public String getLname() { return Lname; }
        public void setLname(String lname) { this.Lname = lname; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFee() { return fee; }
        public void setFee(String fee) { this.fee = fee; }
    }
    
    public static class ClientInfo {
        private int userId;
        private String Fname;
        private String Lname;
        private String email;
        
        public ClientInfo() {}
        
        public ClientInfo(ClientEntity client) {
            if (client != null) {
                this.userId = client.getUserId();
                this.Fname = client.getFname();
                this.Lname = client.getLname();
                this.email = client.getEmail();
            }
        }
          // Getters and setters with explicit JSON property names
        public int getUserId() { return userId; }
        public void setUserId(int userId) { this.userId = userId; }
        
        @JsonProperty("Fname")
        public String getFname() { return Fname; }
        public void setFname(String fname) { this.Fname = fname; }
        
        @JsonProperty("Lname")
        public String getLname() { return Lname; }
        public void setLname(String lname) { this.Lname = lname; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    // Default constructor
    public LegalCaseResponseDTO() {}
    
    // Constructor from LegalCasesEntity
    public LegalCaseResponseDTO(LegalCasesEntity legalCase) {
        this.caseId = legalCase.getCaseId();
        this.title = legalCase.getTitle();
        this.caseNumber = legalCase.getCaseNumber();
        this.description = legalCase.getDescription();
        this.dateSubmitted = legalCase.getDateSubmitted();
        this.status = legalCase.getStatus();
        
        // Convert lawyer entity to lawyer info
        if (legalCase.getLawyer() != null) {
            this.lawyer = new LawyerInfo(legalCase.getLawyer());
        }
        
        // Convert client entity to client info
        if (legalCase.getClient() != null) {
            this.client = new ClientInfo(legalCase.getClient());
        }
    }
    
    // Getters and setters
    public int getCaseId() { return caseId; }
    public void setCaseId(int caseId) { this.caseId = caseId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public long getCaseNumber() { return caseNumber; }
    public void setCaseNumber(long caseNumber) { this.caseNumber = caseNumber; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getDateSubmitted() { return dateSubmitted; }
    public void setDateSubmitted(LocalDateTime dateSubmitted) { this.dateSubmitted = dateSubmitted; }
    
    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }
    
    public LawyerInfo getLawyer() { return lawyer; }
    public void setLawyer(LawyerInfo lawyer) { this.lawyer = lawyer; }
    
    public ClientInfo getClient() { return client; }
    public void setClient(ClientInfo client) { this.client = client; }
    
    public int getAppointmentCount() { return appointmentCount; }
    public void setAppointmentCount(int appointmentCount) { this.appointmentCount = appointmentCount; }
}
