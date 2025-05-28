package com.wachichaw.Case.Entity;


public class LegalCaseRequestDTO {

    private String title;
    private long caseNumber;
    private String description;
    private String status;
    private int lawyerId;

    public LegalCaseRequestDTO() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(long caseNumber) {
        this.caseNumber = caseNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    

    public int getLawyerId() {
        return lawyerId;
    }

    public void setLawyerId(int lawyerId) {
        this.lawyerId = lawyerId;
    }
}
