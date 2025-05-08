package com.wachichaw.User.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private final UserRepo userRepo;
     

    public UserService(UserRepo userRepo){
        this.userRepo = userRepo;
    }


    public ClientEntity createClient(String email, String pass, String Fname, String Lname, String contact_info, String location) {
        ClientEntity client = new ClientEntity();
        client.setEmail(email);
        client.setPassword(pass);
        client.setFname(Fname);
        client.setLname(Lname);
        client.setContactInfo(contact_info);
        client.setLocation(location);
        client.setAccountType(AccountType.CLIENT);  // Set account type as LAWYER
        return userRepo.save(client);
    }

    public LawyerEntity createLawyer(String email, String pass, String Fname, String Lname, String specialization, String experience, String credentials) {
        LawyerEntity lawyer = new LawyerEntity();
        lawyer.setEmail(email);
        lawyer.setPassword(pass);
        lawyer.setFname(Fname);
        lawyer.setLname(Lname);
        lawyer.setSpecialization(specialization);
        lawyer.setExperience(experience);
        lawyer.setCredentials(credentials);
        lawyer.setAccountType(AccountType.LAWYER);
        return userRepo.save(lawyer);
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
