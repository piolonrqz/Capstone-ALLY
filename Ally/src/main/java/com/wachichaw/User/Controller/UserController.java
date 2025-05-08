package com.wachichaw.User.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.wachichaw.User.Entity.UserEntity;
import com.wachichaw.User.Service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController // Changed from @Controller to @RestController for REST APIs
@RequestMapping("/user")
@Tag(name = "User Controller", description = "Handles user operations such as creation, retrieval, and deletion.")
public class UserController {

    @Autowired
    private UserService userService;

    public UserController() {
        super();
    }

    @PostMapping("/save")
    @Operation(summary = "Create a new user", description = "Saves a new user entity to the database.")
    public UserEntity CreateUser(@RequestBody UserEntity user) {
        return userService.CreateUser(user);
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
