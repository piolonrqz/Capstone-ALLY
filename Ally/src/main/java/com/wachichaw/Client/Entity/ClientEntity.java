package com.wachichaw.Client.Entity;

import java.util.List;

import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.User.Entity.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;


@Entity
@Table(name = "Client")
public class ClientEntity extends UserEntity{

    
    @Column(name = "contact_info")
    private String contact_info;

    @Column(name = "location")
    private String location;


    @OneToMany(mappedBy = "client")
    private List<LegalCasesEntity> cases;

    public ClientEntity() {
    }
    public ClientEntity(int clientId, String location, String contact_info ){
        this.location = location;
        this.contact_info = contact_info;
    }


    public String getLocation(){
        return location;
    }

    public void setLocation(String location){
        this.location = location;
    }

    public String getContactInfo(){
        return contact_info;
    }

    public void setContactInfo(String contact_info){
        this.contact_info = contact_info;
    }

}
