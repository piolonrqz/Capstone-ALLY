package com.wachichaw.User.Controller;

import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;

import java.nio.file.Path;
import java.nio.file.Paths;



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
     
   
    @PostMapping("/Client")
    public ClientEntity createClient(@RequestBody ClientEntity client) {
        return userService.createClient(client.getEmail(), client.getPassword(), client.getFname(), client.getLname(), 
                                        client.getPhoneNumber(), client.getAddress(), client.getCity(), 
                                        client.getProvince(), client.getZip());
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
    @RequestParam("credentials") MultipartFile credentialsFile
) throws java.io.IOException {


    String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/credentials";
    Files.createDirectories(Paths.get(uploadDir)); // Ensure directory exists

    String uniqueFileName = UUID.randomUUID() + "_" + credentialsFile.getOriginalFilename();
    Path filePath = Paths.get(uploadDir, uniqueFileName);
    Files.copy(credentialsFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

    // Save the relative path to DB
    String relativePath = "/static/credentials/" + uniqueFileName;

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
        relativePath 
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
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", id);
        response.put("email", email);
        response.put("accountType", accountType);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/getAll")
    @Operation(summary = "Get all users", description = "Retrieves a list of all users.")
    public List<UserEntity> getAllUser() {
        return userService.getAllUser();
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

}
