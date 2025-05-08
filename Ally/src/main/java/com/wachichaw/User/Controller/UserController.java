package com.wachichaw.User.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


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
    @Operation(summary = "Get all users", description = "Retrieves a list of all users.")
    public List<UserEntity> getAllUser() {
        return userService.getAllUser();
    }

    @DeleteMapping("/deleteUser{userId}")
    @Operation(summary = "Delete a user", description = "Deletes a user by their ID.")
    public String DeleteUser(@PathVariable int userId) {
        return userService.deleteUser(userId);
    }
}
