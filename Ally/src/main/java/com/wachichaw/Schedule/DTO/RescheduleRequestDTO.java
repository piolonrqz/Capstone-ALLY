package com.wachichaw.Schedule.DTO;

public class RescheduleRequestDTO {
    private String newStartTime;
    private String newEndTime;

    // Default constructor
    public RescheduleRequestDTO() {
    }

    // Constructor with parameters
    public RescheduleRequestDTO(String newStartTime, String newEndTime) {
        this.newStartTime = newStartTime;
        this.newEndTime = newEndTime;
    }

    // Getters and setters
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
