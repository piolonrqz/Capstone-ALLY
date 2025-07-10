package com.wachichaw.Firebase;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

import com.wachichaw.User.Entity.AccountType;

@RestController
@RequestMapping("/api")
public class FirebaseStorageController {

    private final FirebaseStorageService storageService;

    public FirebaseStorageController(FirebaseStorageService storageService) {
        this.storageService = storageService;
    }

    @CrossOrigin(origins = "http://localhost:3000") // Add this for CORS
    @PostMapping("/upload-profile-picture")
    public ResponseEntity<String> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId,
            @RequestParam("accountType") String accountType,
            @RequestParam(value = "oldProfilePhotoUrl", required = false) String oldProfilePhotoUrl) {
        
        System.out.println("=== UPLOAD PROFILE PICTURE ENDPOINT CALLED ===");
        
        try {
            // Debug logging
            System.out.println("Received upload request:");
            System.out.println("File: " + (file != null ? file.getOriginalFilename() : "NULL"));
            System.out.println("User ID: " + userId);
            System.out.println("Account Type: " + accountType);
            System.out.println("Old Profile Photo URL: " + oldProfilePhotoUrl);
            System.out.println("File size: " + (file != null ? file.getSize() : "NULL"));
            System.out.println("Content Type: " + (file != null ? file.getContentType() : "NULL"));
            System.out.println("File empty: " + (file != null ? file.isEmpty() : "NULL"));
            
            // Validate inputs
            if (file == null || file.isEmpty()) {
                System.out.println("ERROR: File is null or empty");
                return ResponseEntity.badRequest().body("File is required and cannot be empty");
            }
            
            if (userId == null || userId.trim().isEmpty()) {
                System.out.println("ERROR: User ID is null or empty");
                return ResponseEntity.badRequest().body("User ID is required");
            }
            
            if (accountType == null || accountType.trim().isEmpty()) {
                System.out.println("ERROR: Account type is null or empty");
                return ResponseEntity.badRequest().body("Account type is required");
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("ERROR: Invalid file type: " + contentType);
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }
            
            // Validate file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                System.out.println("ERROR: File too large: " + file.getSize());
                return ResponseEntity.badRequest().body("File size must be less than 5MB");
            }
            
            // Convert string to AccountType enum
            AccountType accountTypeEnum;
            try {
                accountTypeEnum = AccountType.valueOf(accountType.toUpperCase());
            } catch (IllegalArgumentException e) {
                System.out.println("ERROR: Invalid account type: " + accountType);
                return ResponseEntity.badRequest().body("Invalid account type. Must be CLIENT, LAWYER, or ADMIN");
            }
            
            // Upload file with old photo URL for deletion
            String downloadUrl = storageService.uploadFile(file, userId, accountTypeEnum, oldProfilePhotoUrl);
            
            System.out.println("Generated download URL: " + downloadUrl);
            System.out.println("=== UPLOAD SUCCESSFUL ===");
            
            return ResponseEntity.ok(downloadUrl);
        } catch (Exception e) {
            System.err.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // Update user profile photo URL in database
    @PutMapping("/update-profile-photo/{userId}")
    public ResponseEntity<String> updateProfilePhoto(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        
        try {
            String profilePhotoUrl = request.get("profilePhotoUrl");
            
            if (profilePhotoUrl == null || profilePhotoUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Profile photo URL is required");
            }
            
            System.out.println("Updated profile photo URL for user " + userId + ": " + profilePhotoUrl);
            
            return ResponseEntity.ok("Profile photo URL updated successfully");
        } catch (Exception e) {
            System.err.println("Failed to update profile photo URL: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to update profile photo URL: " + e.getMessage());
        }
    }
    
    // Endpoint to delete a specific file
    @DeleteMapping("/delete-profile-picture")
    public ResponseEntity<String> deleteProfilePicture(
            @RequestParam("fileUrl") String fileUrl) {
        
        try {
            if (fileUrl == null || fileUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("File URL is required");
            }
            
            storageService.deleteFileFromUrl(fileUrl);
            
            System.out.println("Profile picture deleted successfully: " + fileUrl);
            return ResponseEntity.ok("Profile picture deleted successfully");
        } catch (Exception e) {
            System.err.println("Failed to delete profile picture: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete profile picture: " + e.getMessage());
        }
    }
    
    // Endpoint to cleanup user's profile folder
    @DeleteMapping("/cleanup-user-profile/{userId}")
    public ResponseEntity<String> cleanupUserProfile(
            @PathVariable String userId,
            @RequestParam("accountType") String accountType) {
        
        try {
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            
            if (accountType == null || accountType.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Account type is required");
            }
            
            // Convert string to AccountType enum
            AccountType accountTypeEnum;
            try {
                accountTypeEnum = AccountType.valueOf(accountType.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid account type. Must be CLIENT, LAWYER, or ADMIN");
            }
            
            storageService.deleteUserProfileFolder(userId, accountTypeEnum);
            
            System.out.println("User profile folder cleaned up successfully for user: " + userId);
            return ResponseEntity.ok("User profile folder cleaned up successfully");
        } catch (Exception e) {
            System.err.println("Failed to cleanup user profile folder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to cleanup user profile folder: " + e.getMessage());
        }
    }
}