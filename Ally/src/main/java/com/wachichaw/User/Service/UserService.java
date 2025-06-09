package com.wachichaw.User.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.wachichaw.Admin.Entity.AdminEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Config.JwtUtil;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
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
    
    public ClientEntity createClient(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String profilePhoto) {
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
        client.setProfilePhoto(profilePhoto);
        client.setAccountType(AccountType.CLIENT);  
        return userRepo.save(client);
    }

    public LawyerEntity createLawyer(String email, String pass, String Fname, String Lname, Long phoneNumber, String address, String city, String province, String zip, String barNumber, List<String> specialization , String experience, String credentials) {
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
        lawyer.setBarNumber(barNumber);
        lawyer.setSpecialization(specialization);
        lawyer.setExperience(experience);
        lawyer.setCredentials(credentials); 
        lawyer.setAccountType(AccountType.LAWYER);
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
