package com.wachichaw.User.Controller;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Blob;
import com.google.firebase.cloud.StorageClient;
import com.wachichaw.Admin.Entity.AdminEntity;
import com.wachichaw.Admin.Service.AdminService;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Config.JwtUtil;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Service.LawyerService;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.LoginRequest;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Repo.UserRepo;
import com.wachichaw.User.Service.UserService;
import com.wachichaw.Lawyer.Repo.LawyerRepo;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.URLEncoder;



@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private AdminService adminService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LawyerRepo lawyerRepo;

    @PutMapping("/adminUpdate/{id}")
    public ResponseEntity<AdminEntity> updateAdmin(
            @PathVariable int id,
            @RequestBody AdminEntity admin
    ) {
        AdminEntity updated = userService.updateAdmin(
                id,
                admin.getEmail(),
                admin.getPassword(),
                admin.getFname(),
                admin.getLname(),
                admin.getPhoneNumber(),
                admin.getAddress(),
                admin.getCity(),
                admin.getProvince(),
                admin.getZip()
        );
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/clientUpdate/{id}")
    public ResponseEntity<ClientEntity> updateClient(
            @PathVariable int id,
            @RequestBody ClientEntity client
    ) {
        ClientEntity updated = userService.updateClient(
                id,
                client.getEmail(),
                client.getPassword(),
                client.getFname(),
                client.getLname(),
                client.getPhoneNumber(),
                client.getAddress(),
                client.getCity(),
                client.getProvince(),
                client.getZip(),
                client.getProfilePhotoUrl()
        );
        return ResponseEntity.ok(updated);
    }
    @PutMapping("/lawyerUpdate/credentials/{id}")
    public ResponseEntity<LawyerEntity> updateLawyerCredentials(
            @PathVariable int id,
            @RequestParam("credentials") MultipartFile credentialsFile
    ) throws java.io.IOException {
        String credentialsFileURL = null;

        if (credentialsFile != null && !credentialsFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + credentialsFile.getOriginalFilename();

            Bucket bucket = StorageClient.getInstance().bucket();
            Blob blob = bucket.create("credentials/" + fileName,
                                      credentialsFile.getBytes(),
                                      credentialsFile.getContentType());

            String encodedFileName = URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8);
            credentialsFileURL = String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucket.getName(),
                encodedFileName
            );
        }

        LawyerEntity updated = userService.updateLawyerCredentials(id, credentialsFileURL);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/checkcredentials")
    public ResponseEntity<Map<String, Object>> checkUserCredentials(@PathVariable int id) {
        Optional<LawyerEntity> lawyerOpt = lawyerRepo.findById(id);
        if (lawyerOpt.isPresent()) {
            LawyerEntity lawyer = lawyerOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("credentialsVerified", lawyer.getCredentialsVerified());
            response.put("credentials", lawyer.getCredentials());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Lawyer not found"));
        }
    }

    @PutMapping("/lawyerUpdate/{id}")
    public ResponseEntity<LawyerEntity> updateLawyer(
            @PathVariable int id,
            @RequestBody LawyerEntity lawyer
    ) 
    {
        LawyerEntity updated = userService.updateLawyer(
                id,
                lawyer.getEmail(),
                lawyer.getPassword(),
                lawyer.getFname(),
                lawyer.getLname(),
                lawyer.getPhoneNumber(),
                lawyer.getAddress(),
                lawyer.getCity(),
                lawyer.getProvince(),
                lawyer.getZip(),
                lawyer.getBarNumber(),
                lawyer.getSpecialization(),
                lawyer.getExperience(),
                lawyer.getCredentials(),
                lawyer.getEducationInstitution() 
        );
        return ResponseEntity.ok(updated);
    }
     
     @PostMapping(value = "/Client", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClientEntity> createClient(
        @RequestParam("email") String email,
        @RequestParam("password") String password,
        @RequestParam("Fname") String fname,
        @RequestParam("Lname") String lname,
        @RequestParam("phoneNumber") Long phoneNumber,
        @RequestParam("address") String address,
        @RequestParam("city") String city,
        @RequestParam("province") String province,
        @RequestParam("zip") String zip,
        @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhotoFile
    ) throws java.io.IOException {
        
        String profilePhotoUrl = null;

    if (profilePhotoFile != null && !profilePhotoFile.isEmpty()) {
        String fileName = UUID.randomUUID() + "_" + profilePhotoFile.getOriginalFilename();

        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.create("profile_pictures/" + fileName,
                                  profilePhotoFile.getBytes(),
                                  profilePhotoFile.getContentType());

        String encodedFileName = URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8);
profilePhotoUrl = String.format(
    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
    bucket.getName(),
    encodedFileName
);
    }
        ClientEntity client = userService.createClient(email, password, fname, lname, 
                                        phoneNumber, address, city, province, zip, profilePhotoUrl);
        return ResponseEntity.ok(client);
    }

    @PostMapping("/Admin")
    public AdminEntity createAdmin(@RequestBody AdminEntity admin) {
        return userService.createAdmin(admin.getEmail(), admin.getPassword(), admin.getFname(), admin.getLname(), 
                                        admin.getPhoneNumber(), admin.getAddress(), admin.getCity(), 
                                        admin.getProvince(), admin.getZip());
    }

    @PostMapping(value = "/Lawyer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LawyerEntity> createLawyer(
    @RequestParam("email") String email,
    @RequestParam("password") String password,
    @RequestParam("Fname") String fname,
    @RequestParam("Lname") String lname,
    @RequestParam("phoneNumber") Long phoneNumber,
    @RequestParam("address") String address,
    @RequestParam("city") String city,
    @RequestParam("province") String province,
    @RequestParam("zip") String zip,
    @RequestParam("barNumber") String barNumber,
    @RequestParam("specialization") List<String> specialization,
    @RequestParam("experience") String experience,
    @RequestParam("credentials") MultipartFile credentialsFile,
    @RequestParam(value = "educationInstitution", required = false) String educationInstitution,
    @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhotoFile
) throws java.io.IOException {
    
    String profilePhotoUrl = null;

    if (profilePhotoFile != null && !profilePhotoFile.isEmpty()) {
        String fileName = UUID.randomUUID() + "_" + profilePhotoFile.getOriginalFilename();

        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.create("profile_pictures/" + fileName,
                                  profilePhotoFile.getBytes(),
                                  profilePhotoFile.getContentType());

        String encodedFileName = URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8);
profilePhotoUrl = String.format(
    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
    bucket.getName(),
    encodedFileName
);
    }


    String credentialsFileURL = null;

    if (credentialsFile != null && !credentialsFile.isEmpty()) {
        String fileName = UUID.randomUUID() + "_" + credentialsFile.getOriginalFilename();

        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.create("credentials/" + fileName,
                                  credentialsFile.getBytes(),
                                  credentialsFile.getContentType());

        String encodedFileName = URLEncoder.encode(blob.getName(), StandardCharsets.UTF_8);
credentialsFileURL = String.format(
    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
    bucket.getName(),
    encodedFileName
);
    }

    LawyerEntity lawyer = userService.createLawyer(
        email,
        password,
        fname,
        lname,
        phoneNumber,
        address,
        city,
        province,
        zip,
        barNumber,
        specialization,
        experience,
        credentialsFileURL,
        educationInstitution,
        profilePhotoUrl
    );

    return ResponseEntity.ok(lawyer);
}


    @PostMapping("/login")
    @Operation(summary = "Login a user")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        int id = Integer.parseInt(jwtUtil.extractUserId(token));
        String email = jwtUtil.extractEmail(token);
        String accountType = jwtUtil.extractAccountType(token);
        String profilePhoto = jwtUtil.extractProfilePhoto(token);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", id);
        response.put("email", email);
        response.put("accountType", accountType);
        response.put("profilePhoto", profilePhoto);
        return ResponseEntity.ok(response);
    }    
    @GetMapping("/getAll")
    @Operation(summary = "Get all users", description = "Retrieves a list of all users.")
    public List<UserEntity> getAllUser() {
        return userService.getAllUser();
    }

    @GetMapping("/getUser/{userId}")
    @Operation(summary = "Get a user by ID", description = "Retrieves a specific user by their ID.")
    public ResponseEntity<?> getUserById(@PathVariable int userId) {
        try {
            Optional<UserEntity> user = userService.getUserById(userId);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve user");
        }
    }

    @DeleteMapping("/deleteUser{userId}")
    @Operation(summary = "Delete a user", description = "Deletes a user by their ID.")
    public String DeleteUser(@PathVariable int userId) {
        return userService.deleteUser(userId);
    }
    
    @Autowired
    private LawyerService lawyerService;

    @GetMapping("/search")
    @Operation(summary = "Search and filter lawyers", description = "Filter lawyers by specialization, location, and other criteria")
    public ResponseEntity<List<LawyerEntity>> searchLawyers(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String name) {
        
        // Get all lawyers from the database
        List<LawyerEntity> allLawyers = userRepo.findAll().stream()
                .filter(user -> user.getAccountType() == AccountType.LAWYER)
                .map(user -> (LawyerEntity) user)
                .collect(Collectors.toList());
        
        // Apply filters
        List<LawyerEntity> filteredLawyers = allLawyers.stream()
                .filter(lawyer -> {
                    boolean matches = true;
                    
                    // Filter by specialization
                    if (specialization != null && !specialization.trim().isEmpty() 
                        && !specialization.equalsIgnoreCase("All Specialties")) {
                        matches = matches && lawyer.getSpecialization() != null 
                                && lawyer.getSpecialization().stream()
                                    .anyMatch(spec -> spec.toLowerCase().contains(specialization.toLowerCase()));
                    }
                    
                    // Filter by city
                    if (city != null && !city.trim().isEmpty() 
                        && !city.equalsIgnoreCase("All Locations")) {
                        matches = matches && lawyer.getCity() != null 
                                && lawyer.getCity().toLowerCase().contains(city.toLowerCase());
                    }
                    
                    // Filter by province
                    if (province != null && !province.trim().isEmpty() 
                        && !province.equalsIgnoreCase("All Locations")) {
                        matches = matches && lawyer.getProvince() != null 
                                && lawyer.getProvince().toLowerCase().contains(province.toLowerCase());
                    }
                    
                    // Filter by experience
                    if (experience != null && !experience.trim().isEmpty()) {
                        matches = matches && lawyer.getExperience() != null 
                                && lawyer.getExperience().toLowerCase().contains(experience.toLowerCase());
                    }
                    
                    // Filter by name (first name or last name)
                    if (name != null && !name.trim().isEmpty()) {
                        matches = matches && ((lawyer.getFname() != null 
                                && lawyer.getFname().toLowerCase().contains(name.toLowerCase()))
                                || (lawyer.getLname() != null 
                                && lawyer.getLname().toLowerCase().contains(name.toLowerCase())));
                    }
                    
                    return matches;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(filteredLawyers);
    }
    
    @GetMapping("/specializations")
    @Operation(summary = "Get all unique specializations", description = "Returns all unique specializations available")
    public ResponseEntity<List<String>> getAllSpecializations() {
        List<String> specializations = userRepo.findAll().stream()
                .filter(user -> user.getAccountType() == AccountType.LAWYER)
                .map(user -> (LawyerEntity) user)
                .flatMap(lawyer -> lawyer.getSpecialization() != null ? 
                        lawyer.getSpecialization().stream() : java.util.stream.Stream.empty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(specializations);
    }
    
    @GetMapping("/locations")
    @Operation(summary = "Get all unique locations", description = "Returns all unique cities and provinces")
    public ResponseEntity<List<String>> getAllLocations() {
        List<String> locations = userRepo.findAll().stream()
                .filter(user -> user.getAccountType() == AccountType.LAWYER)
                .map(user -> (LawyerEntity) user)
                .map(lawyer -> {
                    String location = "";
                    if (lawyer.getCity() != null && !lawyer.getCity().trim().isEmpty()) {
                        location += lawyer.getCity();
                    }
                    if (lawyer.getProvince() != null && !lawyer.getProvince().trim().isEmpty()) {
                        if (!location.isEmpty()) location += ", ";
                        location += lawyer.getProvince();
                    }
                    return location;
                })
                .filter(location -> !location.trim().isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/all")
    @Operation(summary = "Get all lawyers", description = "Returns all lawyers in the system")
    public ResponseEntity<List<LawyerEntity>> getAllLawyers() {
        List<LawyerEntity> lawyers = userRepo.findAll().stream()
                .filter(user -> user.getAccountType() == AccountType.LAWYER)
                .map(user -> (LawyerEntity) user)
                .filter(lawyer -> lawyer.getCredentialsVerified() == true)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(lawyers);
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Get total users count
        long totalUsers = userRepo.count();
        
        // Get verified/unverified users instead of active/inactive
        List<UserEntity> allUsers = userRepo.findAll();
        long activeUsers = allUsers.stream().filter(UserEntity::isVerified).count();
        long inactiveUsers = totalUsers - activeUsers;
        
        // Get verified lawyers count
        long verifiedLawyers = lawyerRepo.countByCredentialsVerifiedTrue();
        
        // Get pending verifications
        long pendingVerifications = lawyerRepo.countByCredentialsVerifiedFalse();
        
        // Calculate percentage changes (you might want to store previous values in a database)
        Map<String, String> percentageChanges = new HashMap<>();
        percentageChanges.put("totalUsers", "+0%");  // Replace with actual calculation
        percentageChanges.put("activeUsers", "+0%");
        percentageChanges.put("inactiveUsers", "+0%");
        percentageChanges.put("verifiedLawyers", "+0%");
        
        statistics.put("totalUsers", totalUsers);
        statistics.put("activeUsers", activeUsers);
        statistics.put("inactiveUsers", inactiveUsers);
        statistics.put("verifiedLawyers", verifiedLawyers);
        statistics.put("pendingVerifications", pendingVerifications);
        statistics.put("percentageChanges", percentageChanges);
        
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change user password", description = "Allows authenticated users to change their password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            int userId = Integer.parseInt(jwtUtil.extractUserId(token));
            
            // Get request parameters
            String currentPassword = (String) request.get("currentPassword");
            String newPassword = (String) request.get("newPassword");
            
            // Validate input
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Current password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "New password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (newPassword.length() < 8) {
                response.put("success", false);
                response.put("message", "New password must be at least 8 characters long");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Call service method
            boolean success = userService.changePassword(userId, currentPassword, newPassword);
            
            if (success) {
                response.put("success", true);
                response.put("message", "Password changed successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Current password is incorrect");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}
