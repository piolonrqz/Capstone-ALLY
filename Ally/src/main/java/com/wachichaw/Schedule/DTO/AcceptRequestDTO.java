package com.wachichaw.Schedule.DTO;

public class AcceptRequestDTO {
    private int lawyerId;

    // Default constructor
    public AcceptRequestDTO() {
    }

    // Constructor with parameters
    public AcceptRequestDTO(int lawyerId) {
        this.lawyerId = lawyerId;
    }

    // Getters and setters
    public int getLawyerId() {
        return lawyerId;
    }

    public void setLawyerId(int lawyerId) {
        this.lawyerId = lawyerId;
    }
}
