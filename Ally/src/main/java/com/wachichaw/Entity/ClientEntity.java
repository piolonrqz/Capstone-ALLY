package com.wachichaw.Entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Client")
public class ClientEntity {

    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id")
    private int clientId;

    @Column(name = "location")
    private String location;

    @Column(name = "pref_lang")
    private String prefferedLang;

    @OneToMany(mappedBy = "client")
    private List<CaseEntity> cases;

    public ClientEntity(int clientId, String location, String prefferedLang){
        this.clientId = clientId;
        this.location = location;
        this.prefferedLang = prefferedLang;
    }


    public int getClientId(){
        return clientId;
    }

    public void setClientId(int clientId){
        this.clientId = clientId;
    }

    public String getLocation(){
        return location;
    }

    public void setLocation(String location){
        this.location = location;
    }

    public String getPrefferedLang(){
        return prefferedLang;
    }

    public void setPrefferedLang(String prefferedLang){
        this.prefferedLang = prefferedLang;
    }

}
