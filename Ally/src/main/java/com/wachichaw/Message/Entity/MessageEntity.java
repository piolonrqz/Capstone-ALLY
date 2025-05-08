package com.wachichaw.Message.Entity;

import java.time.LocalDateTime;

import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Client.Entity.ClientEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Message")
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private int messageId;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private LegalCasesEntity legalcaseEntity;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private ClientEntity senderId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "is_temporary", nullable = false)
    private boolean isTemporary;

    public MessageEntity() {}

    public MessageEntity(int messageId, LegalCasesEntity caseEntity, ClientEntity senderId, String content, LocalDateTime sentAt, boolean isTemporary) {
        this.messageId = messageId;
        this.legalcaseEntity = caseEntity;
        this.senderId = senderId;
        this.content = content;
        this.sentAt = sentAt;
        this.isTemporary = isTemporary;
    }

    public int getMessageId() {
        return messageId;
    }

    public void setMessageId(int messageId) {
        this.messageId = messageId;
    }

    public LegalCasesEntity getLegalcaseEntity() {
        return legalcaseEntity;
    }

    public void setLegalcaseEntity(LegalCasesEntity legalcaseEntity) {
        this.legalcaseEntity = legalcaseEntity;
    }

    public ClientEntity getSenderId() {
        return senderId;
    }

    public void setSenderId(ClientEntity senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public boolean isTemporary() {
        return isTemporary;
    }

    public void setTemporary(boolean isTemporary) {
        this.isTemporary = isTemporary;
    }
}
