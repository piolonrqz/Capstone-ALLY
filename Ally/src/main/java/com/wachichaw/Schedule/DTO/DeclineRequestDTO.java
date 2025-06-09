package com.wachichaw.Schedule.DTO;

public class DeclineRequestDTO {
    private int lawyerId;
    private String reason;

    // Default constructor
    public DeclineRequestDTO() {
    }

    // Getters and setters
    public int getLawyerId() {
        return lawyerId;
    }

    public void setLawyerId(int lawyerId) {
        this.lawyerId = lawyerId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
