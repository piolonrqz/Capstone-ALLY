package com.wachichaw.Schedule.DTO;

public class CaseSummaryDTO {
    private int caseId;
    private String title;
    private String status;
    private String description;

    // Constructors
    public CaseSummaryDTO() {
    }

    public CaseSummaryDTO(int caseId, String title, String status, String description) {
        this.caseId = caseId;
        this.title = title;
        this.status = status;
        this.description = description;
    }

    // Getters and Setters
    public int getCaseId() {
        return caseId;
    }

    public void setCaseId(int caseId) {
        this.caseId = caseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
