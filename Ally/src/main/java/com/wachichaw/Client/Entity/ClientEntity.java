package com.wachichaw.Client.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.User.Entity.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;


@Entity
@Table(name = "Client")
public class ClientEntity extends UserEntity{    @OneToMany(mappedBy = "client")
    @JsonManagedReference(value = "client-case")
    private List<LegalCasesEntity> cases;

    public ClientEntity() {
    }

    public List<LegalCasesEntity> getCases() {
        return cases;
    }

    public void setCases(List<LegalCasesEntity> cases) {
        this.cases = cases;
    }
    
}
