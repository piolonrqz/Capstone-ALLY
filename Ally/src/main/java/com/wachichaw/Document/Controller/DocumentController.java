package com.wachichaw.Document.Controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Repo.LegalCaseRepo;
import com.wachichaw.Document.Entity.DocumentEntity;
import com.wachichaw.Document.Service.DocumentService;
import com.wachichaw.User.Repo.UserRepo;
import io.jsonwebtoken.io.IOException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/Docs")
public class DocumentController {

    @Autowired
    private final DocumentService documentService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private LegalCaseRepo legalCaseRepo;
    
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }



    @PostMapping("/documents/upload/{clientId}")
        public ResponseEntity<DocumentEntity> uploadDocument(
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
            Files.createDirectories(Paths.get(uploadDir)); // Ensure the directory exists
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

    
}
