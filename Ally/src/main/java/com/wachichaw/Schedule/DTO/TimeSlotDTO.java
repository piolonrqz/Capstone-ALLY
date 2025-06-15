package com.wachichaw.Schedule.DTO;

public class TimeSlotDTO {
    private String startTime;    // "09:00 AM"
    private String endTime;      // "10:00 AM"
    private boolean available;
    private String unavailableReason; // Optional: "Booked", "Break", etc.
    
    // Default constructor
    public TimeSlotDTO() {
    }
    
    // Constructor with parameters
    public TimeSlotDTO(String startTime, String endTime, boolean available) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
    }
    
    // Constructor with unavailable reason
    public TimeSlotDTO(String startTime, String endTime, boolean available, String unavailableReason) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
        this.unavailableReason = unavailableReason;
    }
    
    // Getters and setters
    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public boolean isAvailable() {
        return available;
    }
    
    public void setAvailable(boolean available) {
        this.available = available;
    }
    
    public String getUnavailableReason() {
        return unavailableReason;
    }
    
    public void setUnavailableReason(String unavailableReason) {
        this.unavailableReason = unavailableReason;
    }
}