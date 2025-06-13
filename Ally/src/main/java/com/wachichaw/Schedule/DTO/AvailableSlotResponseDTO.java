package com.wachichaw.Schedule.DTO;

import java.util.List;

public class AvailableSlotResponseDTO {
    private String date;
    private List<TimeSlotDTO> availableSlots;
    private List<TimeSlotDTO> bookedSlots;
    private String lawyerWorkingHours;
    private int totalSlots;
    private int availableCount;
    private int bookedCount;
    
    // Default constructor
    public AvailableSlotResponseDTO() {
    }
    
    // Constructor with parameters
    public AvailableSlotResponseDTO(String date, List<TimeSlotDTO> availableSlots, 
                                  List<TimeSlotDTO> bookedSlots, String lawyerWorkingHours) {
        this.date = date;
        this.availableSlots = availableSlots;
        this.bookedSlots = bookedSlots;
        this.lawyerWorkingHours = lawyerWorkingHours;
        this.availableCount = availableSlots != null ? availableSlots.size() : 0;
        this.bookedCount = bookedSlots != null ? bookedSlots.size() : 0;
        this.totalSlots = this.availableCount + this.bookedCount;
    }
    
    // Getters and setters
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public List<TimeSlotDTO> getAvailableSlots() {
        return availableSlots;
    }
    
    public void setAvailableSlots(List<TimeSlotDTO> availableSlots) {
        this.availableSlots = availableSlots;
        this.availableCount = availableSlots != null ? availableSlots.size() : 0;
        this.totalSlots = this.availableCount + this.bookedCount;
    }
    
    public List<TimeSlotDTO> getBookedSlots() {
        return bookedSlots;
    }
    
    public void setBookedSlots(List<TimeSlotDTO> bookedSlots) {
        this.bookedSlots = bookedSlots;
        this.bookedCount = bookedSlots != null ? bookedSlots.size() : 0;
        this.totalSlots = this.availableCount + this.bookedCount;
    }
    
    public String getLawyerWorkingHours() {
        return lawyerWorkingHours;
    }
    
    public void setLawyerWorkingHours(String lawyerWorkingHours) {
        this.lawyerWorkingHours = lawyerWorkingHours;
    }
    
    public int getTotalSlots() {
        return totalSlots;
    }
    
    public void setTotalSlots(int totalSlots) {
        this.totalSlots = totalSlots;
    }
    
    public int getAvailableCount() {
        return availableCount;
    }
    
    public void setAvailableCount(int availableCount) {
        this.availableCount = availableCount;
    }
    
    public int getBookedCount() {
        return bookedCount;
    }
    
    public void setBookedCount(int bookedCount) {
        this.bookedCount = bookedCount;
    }
}