package com.wachichaw.Schedule.Entity;

import java.time.LocalDate;

import com.wachichaw.Lawyer.Entity.LawyerEntity;

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

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "is_booked", nullable = false)
    private boolean isBooked;

    public ScheduleEntity() {}

    public ScheduleEntity(int scheduleId, LawyerEntity lawyer, LocalDate date, boolean isBooked) {
        this.scheduleId = scheduleId;
        this.lawyer = lawyer;
        this.date = date;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean isBooked) {
        this.isBooked = isBooked;
    }
}
