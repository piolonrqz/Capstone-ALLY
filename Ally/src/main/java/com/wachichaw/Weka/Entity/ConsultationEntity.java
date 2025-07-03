package com.wachichaw.Weka.Entity;

import java.time.LocalDateTime;

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
@Table(name = "Consultation")
public class ConsultationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consultation_id")
    private int consultationId;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private LegalCasesEntity legalcaseEntity;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "method", nullable = false)
    private String method;

    @Column(name = "is_preliminary")
    private boolean isPreliminary;

    @Column(name = "ai_suggested_outcome", columnDefinition = "TEXT")
    private String aiSuggestedOutcome;

    public ConsultationEntity(){}


    public ConsultationEntity(int consultationId, LegalCasesEntity legalcaseEntity, LocalDateTime startTime,
                              LocalDateTime endTime, String method, boolean isPreliminary,
                              String aiSuggestedOutcome) {
        this.consultationId = consultationId;
        this.legalcaseEntity = legalcaseEntity;
        this.startTime = startTime;
        this.endTime = endTime;
        this.method = method;
        this.isPreliminary = isPreliminary;
        this.aiSuggestedOutcome = aiSuggestedOutcome;
    }

    public int getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(int consultationId) {
        this.consultationId = consultationId;
    }

    public LegalCasesEntity getCaseEntity() {
        return legalcaseEntity;
    }

    public void setCaseEntity(LegalCasesEntity legalcaseEntity) {
        this.legalcaseEntity = legalcaseEntity;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public boolean isPreliminary() {
        return isPreliminary;
    }

    public void setPreliminary(boolean isPreliminary) {
        this.isPreliminary = isPreliminary;
    }

    public String getAiSuggestedOutcome() {
        return aiSuggestedOutcome;
    }

    public void setAiSuggestedOutcome(String aiSuggestedOutcome) {
        this.aiSuggestedOutcome = aiSuggestedOutcome;
    }
}
