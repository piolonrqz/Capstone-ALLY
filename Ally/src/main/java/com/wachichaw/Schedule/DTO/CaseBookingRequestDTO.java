package com.wachichaw.Schedule.DTO;

public class CaseBookingRequestDTO {
    private int clientId;
    private int caseId;
    private String startTime;

    // Default constructor
    public CaseBookingRequestDTO() {
    }

    // Constructor with parameters
    public CaseBookingRequestDTO(int clientId, int caseId, String startTime) {
        this.clientId = clientId;
        this.caseId = caseId;
        this.startTime = startTime;
    }

    // Getters and setters
    public int getClientId() {
        return clientId;
    }

    public void setClientId(int clientId) {
        this.clientId = clientId;
    }

    public int getCaseId() {
        return caseId;
    }

    public void setCaseId(int caseId) {
        this.caseId = caseId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
}
