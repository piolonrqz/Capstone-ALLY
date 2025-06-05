package com.wachichaw.Schedule.Entity;

import java.time.LocalDateTime;

import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Case.Entity.LegalCasesEntity; 

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(name = "booking_start_time", nullable = false) // Modified field and annotation
    private LocalDateTime bookingStartTime; // Modified field

    @Column(name = "booking_end_time", nullable = false) // Added field and annotation
    private LocalDateTime bookingEndTime; // Added field

    @ManyToOne // Added annotation
    @JoinColumn(name = "client_id", nullable = false) // Added annotation
    private ClientEntity client; // Added field

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = true)
    private LegalCasesEntity legalCase;

    @Column(name = "is_booked", nullable = false)
    private boolean isBooked;

    public ScheduleEntity() {}

    public ScheduleEntity(int scheduleId, LawyerEntity lawyer, LocalDateTime bookingStartTime, LocalDateTime bookingEndTime, ClientEntity client, boolean isBooked) {
        this.scheduleId = scheduleId;
        this.lawyer = lawyer;
        this.bookingStartTime = bookingStartTime;
        this.bookingEndTime = bookingEndTime;
        this.client = client;
        this.isBooked = isBooked;
    }

    public ScheduleEntity(int scheduleId, LawyerEntity lawyer, LocalDateTime bookingStartTime, LocalDateTime bookingEndTime, ClientEntity client, LegalCasesEntity legalCase, boolean isBooked) {
        this.scheduleId = scheduleId;
        this.lawyer = lawyer;
        this.bookingStartTime = bookingStartTime;
        this.bookingEndTime = bookingEndTime;
        this.client = client;
        this.legalCase = legalCase;
        this.isBooked = isBooked;
    }

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
    }

    public void setLegalCase(LegalCasesEntity legalCase) {
        this.legalCase = legalCase;
    }
}
