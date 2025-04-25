package com.wachichaw.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.wachichaw.Entity.UserEntity;
import com.wachichaw.Service.UserService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
@RequestMapping("/user")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    public UserController(){
        super();
    }

    @PostMapping("/save")
    public UserEntity CreateUser(@RequestBody UserEntity user) {        
        return userService.CreateUser(user);
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
