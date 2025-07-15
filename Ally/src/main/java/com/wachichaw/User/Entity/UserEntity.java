package com.wachichaw.User.Entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;




@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "First_Name", nullable = false)
    private String Fname;

    @Column(name = "Last_Name", nullable = false)
    private String Lname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone_number", nullable = true)
    private Long phoneNumber;

    @Column(name = "address", nullable = true)
    private String address;

    @Column(name = "city", nullable = true)
    private String city;

    @Column(name = "province", nullable = true)
    private String province;    
    @Column(name = "zip", nullable = true)
    private String zip;
    
    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    

    public UserEntity() {
        super();
    }

    public UserEntity(int userId, String email, String password, String Fname,String Lname, LocalDateTime createdAt, boolean isVerified, Long phoneNumber, String address, String city, String province, String zip) {
        super();
        this.userId = userId;
        this.Fname = Fname;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.isVerified = isVerified;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.city = city;
        this.province = province;
        this.zip = zip;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    @JsonProperty("Fname")
    public String getFname() {
        return Fname;
    }

    @JsonProperty("Fname")
    public void setFname(String Fname) {
        this.Fname = Fname;
    }

    @JsonProperty("Lname")
    public String getLname() {
        return Lname;
    }

    @JsonProperty("Lname")
    public void setLname(String Lname) {
        this.Lname = Lname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean isVerified) {
        this.isVerified = isVerified;
    }
    public AccountType getAccountType() {
        return accountType;
    }
    
    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public Long getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(Long phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public String getProvince() {
        return province;
    }
    public void setProvince(String province) {
        this.province = province;
    }    public String getZip() {
        return zip;
    }
    public void setZip(String zip) {
        this.zip = zip;
    }
    
    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }
    
    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }
    
}