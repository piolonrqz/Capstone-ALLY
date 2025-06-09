package com.wachichaw.Schedule.DTO;

public class BookingRequestDTO {
    private int clientId;
    private int lawyerId;
    private String startTime;

    // Default constructor
    public BookingRequestDTO() {
    }

    // Constructor with parameters
    public BookingRequestDTO(int clientId, int lawyerId, String startTime) {
        this.clientId = clientId;
        this.lawyerId = lawyerId;
        this.startTime = startTime;
    }

    // Getters and setters
    public int getClientId() {
        return clientId;
    }

    public void setClientId(int clientId) {
        this.clientId = clientId;
    }

    public int getLawyerId() {
        return lawyerId;
    }

    public void setLawyerId(int lawyerId) {
        this.lawyerId = lawyerId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
}
