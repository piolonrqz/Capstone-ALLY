package com.wachichaw.Lawyer.Entity;

import java.util.List;

import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Lawyer")
public class LawyerEntity extends UserEntity{

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "experience")
    private String experience;

    @Column(name = "credentials")
    private String credentials;

    @Column(name = "credentials_verified", nullable = true)
    private Boolean credentials_verified = false;

    @OneToMany(mappedBy = "lawyer")
    private List<LegalCasesEntity> legalcaseEntity;

    public LawyerEntity(){
    }


    public LawyerEntity(int userId, String email, String password, String Fname, String Lname,
                    String specialization, String experience, String credentials,
                    String profPic, boolean isVerified, AccountType accountType) {
    super(userId, email, password, Fname, Lname, null, isVerified);
    this.setAccountType(accountType); 
    this.specialization = specialization;
    this.experience = experience;
    this.credentials = credentials;
}

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getCredentials() {
        return credentials;
    }

    public void setCredentials(String credentials) {
        this.credentials = credentials;
    }
}
