package com.wachichaw.Document.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Repo.LegalCaseRepo;
import com.wachichaw.Config.JwtUtil;
import com.wachichaw.Document.Entity.DocumentEntity;
import com.wachichaw.Document.Entity.DocumentDTO;
import com.wachichaw.Document.Service.DocumentService;
import com.wachichaw.User.Repo.UserRepo;

import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private final DocumentService documentService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private LegalCaseRepo legalCaseRepo;
    @Autowired
    private JwtUtil jwtUtil;
    
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Get documents for a specific case with access control
     */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getCaseDocuments(
            @PathVariable int caseId,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            List<DocumentEntity> documents = documentService.getDocumentsByCase(caseId, userId, userRole);
            
            // Convert to DTOs for clean API response
            List<DocumentDTO> documentDTOs = documents.stream()
                .map(DocumentDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(documentDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied: " + e.getMessage());
        }
    }

    /**
     * Get document count for a case
     */
    @GetMapping("/case/{caseId}/count")
    public ResponseEntity<?> getCaseDocumentCount(
            @PathVariable int caseId,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            // Validate access to case
            if (!documentService.validateCaseAccess(caseId, userId, userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: User does not have permission to access this case");
            }

            int count = documentService.getDocumentCountForCase(caseId);
            return ResponseEntity.ok(count);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied: " + e.getMessage());
        }
    }

    /**
     * Enhanced upload with case validation and security
     */
    @PostMapping("/upload/{clientId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable int clientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("caseId") int caseId,
            @RequestParam("documentName") String documentName,
            @RequestParam("documentType") String documentType,
            @RequestParam("status") String status,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            // Validate user is CLIENT and matches the clientId
            if (!userRole.equals("CLIENT") || userId != clientId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: Only clients can upload documents to their own cases");
            }

            // Get the legal case
            LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

            // Upload document with enhanced validation
            DocumentEntity document = documentService.uploadDocumentToCase(
                legalCase, clientId, file, documentName, documentType, status);

            DocumentDTO documentDTO = new DocumentDTO(document);
            return ResponseEntity.ok(documentDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Upload failed: " + e.getMessage());
        }
    }

    /**
     * Delete document with authorization
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable int documentId,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            boolean deleted = documentService.deleteDocument(documentId, userId, userRole);
            
            if (deleted) {
                return ResponseEntity.ok("Document deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete document");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Delete failed: " + e.getMessage());
        }
    }

    /**
     * Download document with access control
     */
    @GetMapping("/{documentId}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable int documentId,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            // Retrieve document with access validation
            DocumentEntity document = documentService.retrieveDocument(documentId, userId, userRole);

            // Prepare file for download
            String fullPath = System.getProperty("user.dir") + "/src/main/resources" + document.getFilePath();
            Path filePath = Paths.get(fullPath);

            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("File not found on server");
            }

            Resource resource = new UrlResource(filePath.toUri());

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + document.getDocumentName() + "\"")
                .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Download failed: " + e.getMessage());
        }
    }

    /**
     * Get document details by ID
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocument(
            @PathVariable int documentId,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            DocumentEntity document = documentService.retrieveDocument(documentId, userId, userRole);
            DocumentDTO documentDTO = new DocumentDTO(document);
            return ResponseEntity.ok(documentDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied: " + e.getMessage());
        }
    }

    /**
     * Get documents by client and case
     */
    @GetMapping("/client/{clientId}/case/{caseId}")
    public ResponseEntity<?> getDocumentsByClientAndCase(
            @PathVariable int clientId,
            @PathVariable int caseId,
            HttpServletRequest request) {
        try {
            // Extract user info from JWT token
            String[] userInfo = extractUserFromRequest(request);
            int userId = Integer.parseInt(userInfo[0]);
            String userRole = userInfo[1];

            // Validate access
            if (!documentService.validateCaseAccess(caseId, userId, userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: User does not have permission to access this case");
            }

            List<DocumentEntity> documents = documentService.getDocumentsByClientAndCase(clientId, caseId);
            
            // Convert to DTOs for clean API response
            List<DocumentDTO> documentDTOs = documents.stream()
                .map(DocumentDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(documentDTOs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied: " + e.getMessage());
        }
    }

    /**
     * Legacy upload endpoint - maintained for backward compatibility
     * Updated to use new request mapping structure
     */
    @PostMapping("/legacy/upload/{clientId}")
    public ResponseEntity<DocumentEntity> legacyUploadDocument(
            @PathVariable int clientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("caseId") int caseId,
            @RequestParam("documentName") String documentName,
            @RequestParam("documentType") String documentType,
            @RequestParam("status") String status
    ) throws java.io.IOException {
        try {
            LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
            
            String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/docs";
            Files.createDirectories(Paths.get(uploadDir));
            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            String relativePath = "/static/docs/" + uniqueFileName; 

            DocumentEntity document = documentService.uploadDocument(
                legalCase,
                clientId,
                documentName,
                relativePath,
                documentType,
                LocalDateTime.now(),
                status
            );

            return ResponseEntity.ok(document);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Extract user information from JWT token in request
     */
    private String[] extractUserFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String userId = jwtUtil.extractUserId(token);
        String accountType = jwtUtil.extractAccountType(token);

        if (userId == null || accountType == null) {
            throw new RuntimeException("Invalid token: missing user information");
        }

        return new String[]{userId, accountType};
    }
}
