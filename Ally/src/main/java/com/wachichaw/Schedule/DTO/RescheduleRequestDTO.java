package com.wachichaw.Schedule.DTO;

public class RescheduleRequestDTO {
    private int clientId;
    private String newStartTime;
    private String newEndTime;

    // Default constructor
    public RescheduleRequestDTO() {
    }

    // Constructor with parameters
    public RescheduleRequestDTO(int clientId, String newStartTime, String newEndTime) {
        this.clientId = clientId;
        this.newStartTime = newStartTime;
        this.newEndTime = newEndTime;
    }

    // Getters and setters
    public int getClientId() {
        return clientId;
    }

    public void setClientId(int clientId) {
        this.clientId = clientId;
    }

    public String getNewStartTime() {
        return newStartTime;
    }

    public void setNewStartTime(String newStartTime) {
        this.newStartTime = newStartTime;
    }

    public String getNewEndTime() {
        return newEndTime;
    }

    public void setNewEndTime(String newEndTime) {
        this.newEndTime = newEndTime;
    }
}
