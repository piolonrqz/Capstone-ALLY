package com.Config;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ImageUploadController {


    private static final String EVENTS_DIR = "C:/Users/USER/Documents/GitHub/Capstone-ALLY/Ally/src/main/resources";
    
    private static final String prof_DIR = "D:/campusxperience/backend/src/main/resources/static/profile_pictures/";


    public String uploadImage(MultipartFile file) throws IOException {
        Path uploadDir = Paths.get(EVENTS_DIR);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IOException("File name is empty.");
        }

        Path filePath = uploadDir.resolve(fileName);
        
        // Write the file to the directory
        Files.write(filePath, file.getBytes());

        return "/uploads/" + fileName; 
    }
    public String uploadProfpic(MultipartFile file) throws IOException {
        // Ensure the upload directory exists
        Path uploadDir = Paths.get(prof_DIR);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Get the original file name and resolve the path
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IOException("File name is empty.");
        }

        Path filePath = uploadDir.resolve(fileName);
        
        // Write the file to the directory
        Files.write(filePath, file.getBytes());

        return "/profile_pictures/" + fileName; // Path relative to the static folder
    }
}