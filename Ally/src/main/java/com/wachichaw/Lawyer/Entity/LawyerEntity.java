package com.wachichaw.Lawyer.Entity;

import java.util.ArrayList;
import java.util.List;

import org.checkerframework.checker.units.qual.C;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.User.Entity.AccountType;
import com.wachichaw.User.Entity.UserEntity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Lawyer")
public class LawyerEntity extends UserEntity{

    @Column(name = "Bar_number", nullable = true)
    private String barNumber;

    @ElementCollection
    @CollectionTable(name = "lawyer_specializations", joinColumns = @JoinColumn(name = "lawyer_id"))
@   Column(name = "specialization")
    private List<String> specialization = new ArrayList<>();

    @Column(name = "experience")
    private String experience;

    @Column(name = "cases_handled")
    private Integer casesHandled;

    @Column(name = "credentials", nullable = true)
    private String credentials;

    @Column(name = "credentials_verified", nullable = true)
    private Boolean credentialsVerified = false;    @OneToMany(mappedBy = "lawyer")
    @JsonManagedReference(value = "lawyer-case")
    private List<LegalCasesEntity> cases;

    public LawyerEntity(){
    }


  public LawyerEntity(
    int userId, String email, String password, String Fname, String Lname,
    Long phoneNumber, String address, String city, String province, String zip,
    String barNumber,
    List<String> specialization, String experience, int casesHandled, String credentials,
    boolean isVerified, AccountType accountType 
    ) {
    super(userId, email, password, Fname, Lname, null, isVerified, phoneNumber, address, city, province, zip);
    this.setAccountType(accountType);
    this.barNumber = barNumber;
    this.specialization = specialization;
    this.experience = experience;
    this.casesHandled = casesHandled;
    this.credentials = credentials;
    }

    public String getBarNumber() {
        return barNumber;
    }
    public void setBarNumber(String barNumber) {
        this.barNumber = barNumber;
    }

    public List<String> getSpecialization() {
        return specialization;
    }

    public void setSpecialization(List<String> specialization) {
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
    public boolean getCredentialsVerified() {
        return credentialsVerified;
    }    public void setCredentialsVerified(Boolean credentialsVerified) {
        this.credentialsVerified = credentialsVerified;
    }

    public List<LegalCasesEntity> getCases() {
        return cases;
    }

    public void setCases(List<LegalCasesEntity> cases) {
        this.cases = cases;
    }

    public int getCasesHandled() {
        return casesHandled;
    }

    public void setCasesHandled(Integer casesHandled) {
        this.casesHandled = casesHandled;
    }
}
