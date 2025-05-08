package com.wachichaw.User.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Service.UserService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    public UserController(UserService userService) {
        super();
    }


    @PostMapping("/client")
    public ClientEntity createClient(@RequestBody ClientEntity client) {
        return userService.createClient(client.getEmail(), client.getPassword(), client.getFname(), client.getLname(), client.getContactInfo(), client.getLocation());
    }

    @PostMapping("/add")
    public LawyerEntity createLawyer(@RequestBody LawyerEntity lawyer) {
        return userService.createLawyer(lawyer.getEmail(), lawyer.getPassword(), lawyer.getFname(), lawyer.getLname(),lawyer.getSpecialization(), lawyer.getExperience(), lawyer.getCredentials());
    }

    @GetMapping("/getAll")
    public List<UserEntity> getAllUser() {
        return userService.getAllUser();
    }

  

    @DeleteMapping("/deleteUser{userId}")
    public String DeleteUser(@PathVariable int userId){
        return userService.deleteUser(userId);
    }
    

    
}
