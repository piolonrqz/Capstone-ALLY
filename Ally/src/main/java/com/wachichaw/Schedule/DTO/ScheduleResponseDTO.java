package com.wachichaw.Schedule.DTO;

import java.time.LocalDateTime;

public class ScheduleResponseDTO {
    private int scheduleId;
    private UserSummaryDTO lawyer;
    private UserSummaryDTO client;
    private LocalDateTime bookingStartTime;
    private LocalDateTime bookingEndTime;
    private boolean isBooked;
    private CaseSummaryDTO legalCase; // Optional - only present for case-based appointments

    // Constructors
    public ScheduleResponseDTO() {
    }

    public ScheduleResponseDTO(int scheduleId, UserSummaryDTO lawyer, UserSummaryDTO client, LocalDateTime bookingStartTime, LocalDateTime bookingEndTime, boolean isBooked) {
        this.scheduleId = scheduleId;
        this.lawyer = lawyer;
        this.client = client;
        this.bookingStartTime = bookingStartTime;
        this.bookingEndTime = bookingEndTime;
        this.isBooked = isBooked;
    }

    public ScheduleResponseDTO(int scheduleId, UserSummaryDTO lawyer, UserSummaryDTO client, LocalDateTime bookingStartTime, LocalDateTime bookingEndTime, boolean isBooked, CaseSummaryDTO legalCase) {
        this.scheduleId = scheduleId;
        this.lawyer = lawyer;
        this.client = client;
        this.bookingStartTime = bookingStartTime;
        this.bookingEndTime = bookingEndTime;
        this.isBooked = isBooked;
        this.legalCase = legalCase;
    }

    // Getters and Setters
    public int getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(int scheduleId) {
        this.scheduleId = scheduleId;
    }

    public UserSummaryDTO getLawyer() {
        return lawyer;
    }

    public void setLawyer(UserSummaryDTO lawyer) {
        this.lawyer = lawyer;
    }

    public UserSummaryDTO getClient() {
        return client;
    }

    public void setClient(UserSummaryDTO client) {
        this.client = client;
    }

    public LocalDateTime getBookingStartTime() {
        return bookingStartTime;
    }

    public void setBookingStartTime(LocalDateTime bookingStartTime) {
        this.bookingStartTime = bookingStartTime;
    }

    public LocalDateTime getBookingEndTime() {
        return bookingEndTime;
    }

    public void setBookingEndTime(LocalDateTime bookingEndTime) {
        this.bookingEndTime = bookingEndTime;
    }

    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean booked) {
        isBooked = booked;
    }

    public CaseSummaryDTO getLegalCase() {
        return legalCase;
    }

    public void setLegalCase(CaseSummaryDTO legalCase) {
        this.legalCase = legalCase;
    }
}
