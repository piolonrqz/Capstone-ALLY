package com.wachichaw.Document.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.wachichaw.Case.Entity.CaseStatus;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Repo.LegalCaseRepo;
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
    @Autowired
    private LegalCaseRepo legalCaseRepo;

    // Allowed file types
    private static final String[] ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"};
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/src/main/resources/static/docs";

    public DocumentService(DocumentRepo documentRepo) {
        this.documentRepo = documentRepo;
    }

    /**
     * Get documents by case with access control validation
     */
    public List<DocumentEntity> getDocumentsByCase(int caseId, int userId, String userRole) {
        if (!validateCaseAccess(caseId, userId, userRole)) {
            throw new RuntimeException("Access denied: User does not have permission to access this case");
        }
        return documentRepo.findByLegalcaseEntityCaseId(caseId);
    }

    /**
     * Validate if user has access to the specified case
     */
    public boolean validateCaseAccess(int caseId, int userId, String userRole) {
        LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
            .orElseThrow(() -> new RuntimeException("Case not found"));

        switch (userRole.toUpperCase()) {
            case "CLIENT":
                // Clients can only access their own cases
                return legalCase.getClient().getUserId() == userId;
            case "LAWYER":
                // Lawyers can access cases assigned to them
                return legalCase.getLawyer() != null && legalCase.getLawyer().getUserId() == userId;
            case "ADMIN":
                // Admins can access all cases
                return true;
            default:
                return false;
        }
    }

    /**
     * Enhanced upload with case validation and security checks
     */
    public DocumentEntity uploadDocumentToCase(LegalCasesEntity legalCase, int clientId, 
                                             MultipartFile file, String documentName, 
                                             String documentType, String status) throws IOException {
        
        // Validate case is ACCEPTED
        if (legalCase.getStatus() != CaseStatus.ACCEPTED) {
            throw new RuntimeException("Documents can only be uploaded to ACCEPTED cases");
        }

        // Validate client is case owner
        if (legalCase.getClient().getUserId() != clientId) {
            throw new RuntimeException("Client can only upload documents to their own cases");
        }

        // Validate file type
        if (!isValidFileType(file.getOriginalFilename())) {
            throw new RuntimeException("File type not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 20MB");
        }

        // Create case-specific directory
        String caseDir = UPLOAD_DIR + "/case_" + legalCase.getCaseId();
        Files.createDirectories(Paths.get(caseDir));

        // Generate unique filename
        String uniqueFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(caseDir, uniqueFileName);
        
        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        String relativePath = "/static/docs/case_" + legalCase.getCaseId() + "/" + uniqueFileName;

        // Get client entity
        ClientEntity client = clientRepo.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));

        // Create document entity
        DocumentEntity document = new DocumentEntity();
        document.setCaseEntity(legalCase);
        document.setUploadedBy(client);
        document.setDocumentName(documentName);
        document.setDocumentType(documentType);
        document.setUploadedAt(LocalDateTime.now());
        document.setFilePath(relativePath);
        document.setStatus(status);

        return documentRepo.save(document);
    }

    /**
     * Legacy upload method - maintained for backward compatibility
     */
    public DocumentEntity uploadDocument(LegalCasesEntity legalCase, int clientId, String documentName, 
                                       String filePath, String documentType, LocalDateTime uploadedAt, String status) {
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

    /**
     * Retrieve document with access control
     */
    public DocumentEntity retrieveDocument(int documentId, int userId, String userRole) {
        DocumentEntity document = documentRepo.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!validateDocumentAccess(document, userId, userRole)) {
            throw new RuntimeException("Access denied: User does not have permission to access this document");
        }

        return document;
    }

    /**
     * Delete document with access control
     */
    public boolean deleteDocument(int documentId, int userId, String userRole) {
        DocumentEntity document = documentRepo.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));

        // Only clients can delete their own documents
        if (!userRole.equals("CLIENT") || document.getUploadedBy().getUserId() != userId) {
            throw new RuntimeException("Access denied: Only document owners can delete documents");
        }

        try {
            // Delete physical file
            Path filePath = Paths.get(System.getProperty("user.dir") + "/src/main/resources" + document.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            // Delete database record
            documentRepo.delete(document);
            return true;
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete document file: " + e.getMessage());
        }
    }

    /**
     * Get document count for case
     */
    public int getDocumentCountForCase(int caseId) {
        return documentRepo.countByLegalcaseEntityCaseId(caseId);
    }

    /**
     * Validate document access for specific operations
     */
    private boolean validateDocumentAccess(DocumentEntity document, int userId, String userRole) {
        LegalCasesEntity legalCase = document.getCaseEntity();
        
        switch (userRole.toUpperCase()) {
            case "CLIENT":
                // Clients can access documents from their own cases
                return legalCase.getClient().getUserId() == userId;
            case "LAWYER":
                // Lawyers can access documents from their assigned cases
                return legalCase.getLawyer() != null && legalCase.getLawyer().getUserId() == userId;
            case "ADMIN":
                // Admins can access all documents
                return true;
            default:
                return false;
        }
    }

    /**
     * Validate file type against allowed extensions
     */
    private boolean isValidFileType(String filename) {
        if (filename == null || filename.isEmpty()) {
            return false;
        }
        
        String extension = filename.toLowerCase();
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (extension.endsWith(allowedExt)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get documents by lawyer ID
     */
    public List<DocumentEntity> getDocumentsByLawyer(int lawyerId) {
        return documentRepo.findDocumentsByLawyerId(lawyerId);
    }

    /**
     * Get documents by client and case
     */
    public List<DocumentEntity> getDocumentsByClientAndCase(int clientId, int caseId) {
        return documentRepo.findByUploadedByUserIdAndLegalcaseEntityCaseId(clientId, caseId);
    }
}
