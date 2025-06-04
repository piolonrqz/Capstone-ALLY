package com.wachichaw.Case.Entity;


public class LegalCaseRequestDTO {

    private String title;
    private String description;
    private CaseStatus status;
    private int lawyerId;

    public LegalCaseRequestDTO() {
    }

    public String getTitle() {
        return title;
    }    public void setTitle(String title) {
        this.title = title;
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
