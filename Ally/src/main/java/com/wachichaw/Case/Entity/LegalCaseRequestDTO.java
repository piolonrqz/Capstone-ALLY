package com.wachichaw.Case.Entity;


public class LegalCaseRequestDTO {

    private String title;
    private String caseType;
    private UrgencyLevel urgencyLevel; // e.g., "High", "Medium", "Low"
    private String description;
    private CaseStatus status;
    private int lawyerId;

    public LegalCaseRequestDTO() {
    }

    public String getTitle() {
        return title;
    }    
    
    public void setTitle(String title) {
        this.title = title;
    }

    public String getCaseType() {
        return caseType;
    }

    public void setCaseType(String caseType) {
        this.caseType = caseType;
    }

    public UrgencyLevel getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(UrgencyLevel urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }
    

    public int getLawyerId() {
        return lawyerId;
    }

    public void setLawyerId(int lawyerId) {
        this.lawyerId = lawyerId;
    }
}
