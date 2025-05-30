package com.wachichaw.Schedule.DTO;

public class UserSummaryDTO {
    private int userId;
    private String Fname;
    private String Lname;
    private String email;
    private Long phoneNumber;

    // Constructors
    public UserSummaryDTO() {
    }

    public UserSummaryDTO(int userId, String Fname, String Lname, String email, Long phoneNumber) {
        this.userId = userId;
        this.Fname = Fname;
        this.Lname = Lname;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getFname() {
        return Fname;
    }

    public void setFname(String Fname) {
        this.Fname = Fname;
    }

    public String getLname() {
        return Lname;
    }

    public void setLname(String Lname) {
        this.Lname = Lname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(Long phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
