package com.wachichaw.Case.Entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Message.Entity.MessageEntity;

import jakarta.persistence.*;

@Entity
@Table(name = "Cases")
public class LegalCasesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_id")
    private int caseId;

    @Column(name = "title", nullable = true)
    private String title;

    @Column(name = "case_no", nullable = true, unique = true)
    private long caseNumber;

    @Column(name = "description", nullable = true)
    private String description;    @CreationTimestamp
    @Column(name = "date_submitted", updatable = false)
    private LocalDateTime dateSubmitted;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CaseStatus status;

    @ManyToOne
    @JoinColumn(name = "lawyer_id")
    @JsonBackReference(value = "lawyer-case")
    private LawyerEntity lawyer;

    @ManyToOne
    @JoinColumn(name = "client_id", referencedColumnName = "user_id")
    @JsonBackReference(value = "client-case")
    private ClientEntity client;

    @OneToMany(mappedBy = "legalcaseEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MessageEntity> messages;

    public LegalCasesEntity(){}    public LegalCasesEntity(int caseId, String title, long caseNumber, String description, LocalDateTime dateSubmitted, CaseStatus status, LawyerEntity lawyer, ClientEntity client) {
        this.caseId = caseId;
        this.title = title;
        this.caseNumber = caseNumber;
        this.description = description;
        this.dateSubmitted = dateSubmitted;
        this.status = status;
        this.lawyer = lawyer;
        this.client = client;
    }

    public int getCaseId() {
        return caseId;
    }

    public void setCaseId(int caseId) {
        this.caseId = caseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(long caseNumber) {
        this.caseNumber = caseNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateSubmitted() {
        return dateSubmitted;
    }

    public void setDateSubmitted(LocalDateTime dateSubmitted) {
        this.dateSubmitted = dateSubmitted;
    }    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public LawyerEntity getLawyer() {
        return lawyer;
    }

    public void setLawyer(LawyerEntity lawyer) {
        this.lawyer = lawyer;
    }

    public ClientEntity getClient() {
        return client;
    }

    public void setClient(ClientEntity client) {
        this.client = client;
    }
    public List<MessageEntity> getMessages() {
        return messages;
    }

    public void setMessages(List<MessageEntity> messages) {
        this.messages = messages;
    }

 
}
