package com.wachichaw.Schedule.DTO;

public class AvailabilityResponseDTO {
    private boolean available;
    private String message;

    // Default constructor
    public AvailabilityResponseDTO() {
    }

    // Constructor with parameters
    public AvailabilityResponseDTO(boolean available, String message) {
        this.available = available;
        this.message = message;
    }

    // Getters and setters
    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
