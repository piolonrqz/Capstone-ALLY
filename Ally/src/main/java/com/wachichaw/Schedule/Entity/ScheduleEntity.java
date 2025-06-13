package com.wachichaw.Schedule.Entity;

import java.time.LocalDateTime;

import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Case.Entity.LegalCasesEntity; 

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Schedule")
public class ScheduleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private int scheduleId;

    @ManyToOne
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerEntity lawyer;

    @Column(name = "booking_start_time", nullable = false)
    private LocalDateTime bookingStartTime; 

    @Column(name = "booking_end_time", nullable = false) 
    private LocalDateTime bookingEndTime; 

    @ManyToOne 
    @JoinColumn(name = "client_id", nullable = false)
    private ClientEntity client; 

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = true)
    private LegalCasesEntity legalCase;    
    @Column(name = "is_booked", nullable = false)
    private boolean isBooked;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "decline_reason")
    private String declineReason;

    public ScheduleEntity() {}


    public int getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(int scheduleId) {
        this.scheduleId = scheduleId;
    }

    public LawyerEntity getLawyer() {
        return lawyer;
    }

    public void setLawyer(LawyerEntity lawyer) {
        this.lawyer = lawyer;
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

    public ClientEntity getClient() {
        return client;
    }

    public void setClient(ClientEntity client) {
        this.client = client;
    }

    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean booked) {
        isBooked = booked;
    }

    public LegalCasesEntity getLegalCase() {
        return legalCase;
    }    public void setLegalCase(LegalCasesEntity legalCase) {
        this.legalCase = legalCase;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public String getDeclineReason() {
        return declineReason;
    }

    public void setDeclineReason(String declineReason) {
        this.declineReason = declineReason;
    }
}
