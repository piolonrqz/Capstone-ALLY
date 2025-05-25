package com.wachichaw.Document.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;
import com.wachichaw.Document.Entity.DocumentEntity;
import com.wachichaw.Document.Repo.DocumentRepo;


@Service
public class DocumentService {

    @Autowired
    private final DocumentRepo documentRepo;
    @Autowired
    private ClientRepo clientRepo;

    public DocumentService(DocumentRepo documentRepo) {
        this.documentRepo = documentRepo;
    }

    
    public DocumentEntity uploadDocument(LegalCasesEntity legalCase,int clientId, String documentName, String filePath, String documentType, LocalDateTime uploadedAt, String status) {
       ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
        DocumentEntity document = new DocumentEntity();
        document.setCaseEntity(legalCase);
        document.setUploadedBy(client);
        document.setDocumentName(documentName);
        document.setDocumentType(documentType);
        document.setUploadedAt(uploadedAt);
        document.setFilePath(filePath);
        document.setStatus(status);
        return documentRepo.save(document);
    }

    public void retrieveDocument() {
       
    }

    public void deleteDocument() {
       
    }
    
}
