package com.wachichaw.User.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.wachichaw.Admin.Entity.AdminEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Entity.TempClient;
import com.wachichaw.Config.JwtUtil;
import com.wachichaw.EmailConfig.VerificationService;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Entity.TempLawyer;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private final UserRepo userRepo;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private TempClient tempClientStorageService;
    @Autowired
    private TempLawyer tempLawyerStorageService;
    @Autowired
    private VerificationService verificationService;
     

    public UserService(UserRepo userRepo,PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminEntity createAdmin(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip) {
        AdminEntity admin = new AdminEntity();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(pass));
        admin.setFname(Fname);
        admin.setLname(Lname);
        admin.setPhoneNumber(phoneNumber);
        admin.setAddress(address);
        admin.setCity(city);
        admin.setProvince(province);
        admin.setZip(zip);
        admin.setAccountType(AccountType.ADMIN);  
        admin.setDepartment("General"); 
        return userRepo.save(admin);
    }    

    public ClientEntity saveClient(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String profilePhoto) {
        ClientEntity client = new ClientEntity();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(pass));
        client.setFname(Fname);
        client.setLname(Lname);
        client.setPhoneNumber(phoneNumber);
        client.setAddress(address);
        client.setCity(city);
        client.setProvince(province);
        client.setZip(zip);
        client.setProfilePhotoUrl(profilePhoto);
        client.setAccountType(AccountType.CLIENT);  
        return userRepo.save(client);
    }
    
    public ClientEntity createClient(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String profilePhoto) {
        ClientEntity client = new ClientEntity();
        client.setEmail(email);
        client.setPassword(pass);
        client.setFname(Fname);
        client.setLname(Lname);
        client.setPhoneNumber(phoneNumber);
        client.setAddress(address);
        client.setCity(city);
        client.setProvince(province);
        client.setZip(zip);
        client.setProfilePhotoUrl(profilePhoto);
        client.setAccountType(AccountType.CLIENT);  
        int token = (int)(Math.random() * 900000) + 100000;
        tempClientStorageService.saveUnverifiedUser(token, client);
        tempClientStorageService.getUnverifiedUser(token);
        System.out.println("Lawyer retrieved: " + profilePhoto);
        System.out.println("Lawyer email: " + client.getEmail());
        System.out.println("Lawyer first name: " + Fname);
        System.out.println("Lawyer password: " + token);
        ClientEntity savedClient = client;
        verificationService.sendVerificationEmail(savedClient.getEmail(), savedClient.getFname(), token);
        return savedClient;
    }
    public void verifyClient(String email) {
        Optional<UserEntity> optionalUser = userRepo.findByEmail(email);
        if (!optionalUser.isPresent() || !(optionalUser.get() instanceof ClientEntity)) {

            throw new RuntimeException("User not found with email: " + email);
        }

        ClientEntity user = (ClientEntity) optionalUser.get();
        user.setVerified(true); 
        userRepo.save(user);
    }

    public LawyerEntity saveLawyer(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String barNumber, List<String> specialization , String experience, String credentials, String educationInstitution,String profilePhoto) {
        LawyerEntity lawyer = new LawyerEntity();
        lawyer.setEmail(email);
        lawyer.setPassword(passwordEncoder.encode(pass));
        lawyer.setFname(Fname);
        lawyer.setLname(Lname);
        lawyer.setPhoneNumber(phoneNumber);
        lawyer.setAddress(address);
        lawyer.setCity(city);
        lawyer.setProvince(province);
        lawyer.setZip(zip);
        lawyer.setCasesHandled(0);
        lawyer.setBarNumber(barNumber);
        lawyer.setSpecialization(specialization);
        lawyer.setExperience(experience);
        lawyer.setCredentials(credentials); 
        lawyer.setEducationInstitution(educationInstitution);
        lawyer.setProfilePhotoUrl(profilePhoto);
        lawyer.setAccountType(AccountType.LAWYER);
        return userRepo.save(lawyer);
    }

    public LawyerEntity createLawyer(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String barNumber, List<String> specialization , String experience, String credentials,String educationInstitution, String profilePhoto) {
        LawyerEntity lawyer = new LawyerEntity();
        lawyer.setEmail(email);
        lawyer.setPassword(pass);
        lawyer.setFname(Fname);
        lawyer.setLname(Lname);
        lawyer.setPhoneNumber(phoneNumber);
        lawyer.setAddress(address);
        lawyer.setCity(city);
        lawyer.setProvince(province);
        lawyer.setZip(zip);
        lawyer.setBarNumber(barNumber);
        lawyer.setSpecialization(specialization);
        lawyer.setExperience(experience);
        lawyer.setCredentials(credentials); 
        lawyer.setEducationInstitution(educationInstitution);
        lawyer.setProfilePhotoUrl(profilePhoto);
        lawyer.setAccountType(AccountType.LAWYER);
        int token = (int)(Math.random() * 900000) + 100000;
        tempLawyerStorageService.saveUnverifiedUser(token, lawyer);
        tempLawyerStorageService.getUnverifiedUser(token);
        System.out.println("Lawyer retrieved: " + profilePhoto);
        System.out.println("Lawyer email: " + lawyer.getEmail());
        System.out.println("Lawyer first name: " + Fname);
        System.out.println("Lawyer password: " + token);
        LawyerEntity savedLawyer = lawyer;
        verificationService.sendVerificationEmail(savedLawyer.getEmail(), savedLawyer.getFname(), token);
        return savedLawyer;
    }
    public void verifyLawyer(String email) {
        Optional<UserEntity> optionalUser = userRepo.findByEmail(email);

        if (!optionalUser.isPresent() || !(optionalUser.get() instanceof LawyerEntity)) {
            throw new RuntimeException("User not found with email: " + email);
        }

        LawyerEntity user = (LawyerEntity) optionalUser.get();
        user.setVerified(true); 
        userRepo.save(user);
    }

            public AdminEntity updateAdmin(int id, String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip) {
            AdminEntity admin = (AdminEntity) userRepo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with id: " + id));
            admin.setEmail(email);
            if (pass != null && !pass.trim().isEmpty()) {
                admin.setPassword(passwordEncoder.encode(pass));
            }
            admin.setFname(Fname);
            admin.setLname(Lname);
            admin.setPhoneNumber(phoneNumber);
            admin.setAddress(address);
            admin.setCity(city);
            admin.setProvince(province);
            admin.setZip(zip);
            return userRepo.save(admin);
        }

        public ClientEntity updateClient(int id, String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String profilePhoto) {
            ClientEntity client = (ClientEntity) userRepo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Client not found with id: " + id));
            client.setEmail(email);
            if (pass != null && !pass.trim().isEmpty()) {
                client.setPassword(passwordEncoder.encode(pass));
            }
            client.setFname(Fname);
            client.setLname(Lname);
            client.setPhoneNumber(phoneNumber);
            client.setAddress(address);
            client.setCity(city);
            client.setProvince(province);
            client.setZip(zip);
            client.setProfilePhotoUrl(profilePhoto);
            return userRepo.save(client);
        }

        public LawyerEntity updateLawyer(int id,String email,String pass,String Fname,String Lname,Long phoneNumber,String address,String city,String province,String zip,String barNumber,List<String> specialization,String experience,String credentials, String educationInstitution)   
          {
            LawyerEntity lawyer = (LawyerEntity) userRepo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Lawyer not found with id: " + id));
            lawyer.setEmail(email);
            if (pass != null && !pass.trim().isEmpty()) {
                lawyer.setPassword(passwordEncoder.encode(pass));
            }
            lawyer.setFname(Fname);
            lawyer.setLname(Lname);
            lawyer.setPhoneNumber(phoneNumber);
            lawyer.setAddress(address);
            lawyer.setCity(city);
            lawyer.setProvince(province);
            lawyer.setZip(zip);
            lawyer.setBarNumber(barNumber);
            if (specialization != null && !specialization.isEmpty()) {
                lawyer.setSpecialization(specialization);
            }
            lawyer.setExperience(experience);
            if (credentials != null && !credentials.trim().isEmpty()) {
                lawyer.setCredentials(credentials);
            }
            // Always set educationInstitution, even if empty (to allow clearing)
            lawyer.setEducationInstitution(educationInstitution);
            return userRepo.save(lawyer);
        }
    
    public String authenticate(String email, String password) {
        UserEntity foundUser = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        if (passwordEncoder.matches(password, foundUser.getPassword())) { 
            return jwtUtil.generateToken(foundUser); 
        } else {
            System.out.println("Invalid credentials: password does not match."); 
            throw new RuntimeException("Invalid credentials"); 
        }
    }

    public List<UserEntity> getAllUser() {
        return userRepo.findAll();
    }

    public Optional<UserEntity> getUserById(int id) {
        return userRepo.findById(id);
    }

     
public String deleteUser(int id) {
    String msg = " ";
    userRepo.deleteById(id);
    msg = "User successfully deleted!";
    return msg;
}
    
}
