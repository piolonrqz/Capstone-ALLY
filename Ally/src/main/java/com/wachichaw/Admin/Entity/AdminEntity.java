package com.wachichaw.Admin.Entity;

import com.wachichaw.User.Entity.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "admins")  // Use lowercase, plural to avoid reserved words and case issues
public class AdminEntity extends UserEntity {

    @Column(name = "department", nullable = false)
    private String department;

    public AdminEntity() {
        super();
    }

    public AdminEntity(String department) {
        super();
        this.department = department;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
