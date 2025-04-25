package com.wachichaw.Service;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.wachichaw.Controller.ImageUploadController;
import com.wachichaw.Entity.UserEntity;
import com.wachichaw.Repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private final UserRepo userRepo;
    @Autowired
    private ImageUploadController imageUploadController;  

    public UserService(UserRepo userRepo){
        this.userRepo = userRepo;
    }


    public UserEntity CreateUser(UserEntity user){
       return userRepo.save(user);
    }

    public List<UserEntity> getAllUser() {
        return userRepo.findAll();
    }

    public Optional<UserEntity> getUserById(int id) {
        return userRepo.findById(id);
    }

     public UserEntity updateUser(int userId, MultipartFile file, String currentPassword, String name, String email, String newPassword) throws IOException, java.io.IOException {
    // Find the user by its ID
    UserEntity existingUser = userRepo.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

    // Verify the current password
    if (!existingUser.getPassword().equals(currentPassword)) {
        throw new RuntimeException("Current password is incorrect");
    }

    // Update the user's name
    if (name != null && !name.isEmpty()) {
        existingUser.setName(name);
    }

    // Update the user's password
    if (newPassword != null && !newPassword.isEmpty()) {
        existingUser.setPassword(newPassword);
    }
    // Update the user's email if provided and unique
    if (email != null && !email.equals(existingUser.getEmail())) {
        if (userRepo.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }
        existingUser.setEmail(email);
    }

    // Handle profile picture upload if a file is provided
    if (file != null && !file.isEmpty()) {
        String profPicUrl = imageUploadController.uploadProfpic(file);
        existingUser.setProfPic(profPicUrl); 
    }

    return userRepo.save(existingUser);
}

public String deleteUser(int id) {
    String msg = " ";
    userRepo.deleteById(id);
    msg = "User record successfully deleted!";
    return msg;
}
    
}
