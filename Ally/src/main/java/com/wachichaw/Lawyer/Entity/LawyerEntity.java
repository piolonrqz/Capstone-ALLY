package com.wachichaw.Lawyer.Entity;

import java.util.List;

import com.wachichaw.Case.Entity.CaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Lawyer")
public class LawyerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lawyer_id")
    private int lawyerId;

    @Column(name = "bio")
    private String bio;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "working_hours")
    private String workingHours;

    @Column(name = "availability_status")
    private String availabilityStatus;

    @Column(name = "bar_license_numbere")
    private String barLicenseNumber;

    @OneToMany(mappedBy = "lawyer")
    private List<CaseEntity> cases;


    public LawyerEntity(int lawyerId, String bio, String specialization, String workingHours, String availabilityStatus, String barLicenseNumber) {
        this.lawyerId = lawyerId;
        this.bio = bio;
        this.specialization = specialization;
        this.workingHours = workingHours;
        this.availabilityStatus = availabilityStatus;
        this.barLicenseNumber = barLicenseNumber;
    }

    public int getLawyerId() {
        return lawyerId;
    }

    public void setLawyerId(int lawyerId) {
        this.lawyerId = lawyerId;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getWorkingHours() {
        return workingHours;
    }

    public void setWorkingHours(String workingHours) {
        this.workingHours = workingHours;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public String getBarLicenseNumber() {
        return barLicenseNumber;
    }

    public void setBarLicenseNumber(String barLicenseNumber) {
        this.barLicenseNumber = barLicenseNumber;
    }
}
