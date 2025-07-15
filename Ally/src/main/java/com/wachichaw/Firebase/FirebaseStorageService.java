package com.wachichaw.Firebase;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.wachichaw.User.Entity.AccountType;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class FirebaseStorageService {

    public String uploadFile(MultipartFile file, String userId, AccountType accountType) throws IOException {
        return uploadFile(file, userId, accountType, null);
    }

    public String uploadFile(MultipartFile file, String userId, AccountType accountType, String oldProfilePhotoUrl) throws IOException {
        // Ensure userId is not null or empty
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        // Clean the userId to remove any path separators
        String cleanUserId = userId.replaceAll("[/\\\\]", "_");

        // Delete old profile photo if URL is provided
        if (oldProfilePhotoUrl != null && !oldProfilePhotoUrl.trim().isEmpty()) {
            deleteFileFromUrl(oldProfilePhotoUrl);
        }

        String fileName;
        
        if (accountType == AccountType.CLIENT) {
            // Save into profile_pictures folder with the user's ID subfolder
            fileName = "profile_pictures/client/" + cleanUserId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        }
        else if (accountType == AccountType.LAWYER) {
            // Save into lawyer_profile_pictures folder with the user's ID subfolder
            fileName = "profile_pictures/lawyer/" + cleanUserId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        }
        else if (accountType == AccountType.ADMIN) {
            // Save into admin_profile_pictures folder with the user's ID subfolder
            fileName = "profile_pictures/admin/" + cleanUserId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        }
        else {
            // Default fallback
            fileName = "profile_pictures/unknown/" + cleanUserId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        }
        
        Bucket bucket = StorageClient.getInstance().bucket();
        
        // Create BlobInfo with public read access
        Map<String, String> metadata = new HashMap<>();
        metadata.put("firebaseStorageDownloadTokens", UUID.randomUUID().toString());
        
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket.getName(), fileName)
                .setContentType(file.getContentType())
                .setMetadata(metadata)
                .build();
        
        // Upload the file
        Storage storage = StorageClient.getInstance().bucket().getStorage();
        Blob blob = storage.create(blobInfo, file.getBytes());
        
        // Make the file publicly accessible
        blob.createAcl(com.google.cloud.storage.Acl.of(com.google.cloud.storage.Acl.User.ofAllUsers(), 
                      com.google.cloud.storage.Acl.Role.READER));
        
        // Log the actual blob name created
        System.out.println("Created blob with name: " + blob.getName());
        
        // Return the public URL
        String publicUrl = String.format("https://storage.googleapis.com/%s/%s", bucket.getName(), fileName);
        System.out.println("Generated public URL: " + publicUrl);
        
        return publicUrl;
    }
    
    // Method to delete file by filename
    public void deleteFile(String fileName) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket();
            Storage storage = bucket.getStorage();
            boolean deleted = storage.delete(bucket.getName(), fileName);
            
            if (deleted) {
                System.out.println("Successfully deleted file: " + fileName);
            } else {
                System.out.println("File not found or already deleted: " + fileName);
            }
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to delete file: " + fileName + " - " + e.getMessage());
        }
    }
    
    // Method to delete file from full URL
    public void deleteFileFromUrl(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.trim().isEmpty()) {
                return;
            }
            
            // Extract filename from URL
            // URL format: https://storage.googleapis.com/bucket-name/path/to/file
            String fileName = extractFileNameFromUrl(fileUrl);
            
            if (fileName != null && !fileName.trim().isEmpty()) {
                deleteFile(fileName);
            } else {
                System.err.println("Could not extract filename from URL: " + fileUrl);
            }
        } catch (Exception e) {
            System.err.println("Failed to delete file from URL: " + fileUrl + " - " + e.getMessage());
        }
    }
    
    // Helper method to extract filename from Firebase Storage URL
    private String extractFileNameFromUrl(String url) {
        try {
            // Handle different URL formats
            if (url.contains("storage.googleapis.com/")) {
                // Format: https://storage.googleapis.com/bucket-name/path/to/file
                String[] parts = url.split("storage.googleapis.com/");
                if (parts.length > 1) {
                    String[] bucketAndPath = parts[1].split("/", 2);
                    if (bucketAndPath.length > 1) {
                        return bucketAndPath[1]; // Return the path after bucket name
                    }
                }
            } else if (url.contains("firebasestorage.googleapis.com/")) {
                // Format: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/encoded-path
                // This is more complex and would need URL decoding
                System.err.println("Firebase Storage API URL format not supported for direct deletion: " + url);
                return null;
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting filename from URL: " + url + " - " + e.getMessage());
            return null;
        }
    }
    
    // Method to delete all files in a user's profile folder (cleanup method)
    public void deleteUserProfileFolder(String userId, AccountType accountType) {
        try {
            String cleanUserId = userId.replaceAll("[/\\\\]", "_");
            String folderPath;
            
            if (accountType == AccountType.CLIENT) {
                folderPath = "profile_pictures/client/" + cleanUserId + "/";
            } else if (accountType == AccountType.LAWYER) {
                folderPath = "profile_pictures/lawyer/" + cleanUserId + "/";
            } else if (accountType == AccountType.ADMIN) {
                folderPath = "profile_pictures/admin/" + cleanUserId + "/";
            } else {
                folderPath = "profile_pictures/unknown/" + cleanUserId + "/";
            }
            
            Bucket bucket = StorageClient.getInstance().bucket();
            Storage storage = bucket.getStorage();
            
            // List all files in the user's folder
            storage.list(bucket.getName(), Storage.BlobListOption.prefix(folderPath))
                    .iterateAll()
                    .forEach(blob -> {
                        try {
                            blob.delete();
                            System.out.println("Deleted: " + blob.getName());
                        } catch (Exception e) {
                            System.err.println("Failed to delete: " + blob.getName() + " - " + e.getMessage());
                        }
                    });
                    
            System.out.println("Cleanup completed for user folder: " + folderPath);
        } catch (Exception e) {
            System.err.println("Failed to cleanup user profile folder: " + e.getMessage());
        }
    }
}