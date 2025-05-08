package com.wachichaw.Resource.Entity;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import com.wachichaw.Admin.Entity.AdminEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Resources")
public class ResourceEntity{
    
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private int resourceId;

    @Column(name = "title")
    private String title;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "is_offline_available")
    private boolean isOfflineAvailable;

    @ManyToOne
    @JoinColumn(name = "uploaded_by") 
    private AdminEntity uploadedBy;


    @CreationTimestamp
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public ResourceEntity(){}
    

    public ResourceEntity(int resourceId, String title, String contentType, boolean isOfflineAvailable, AdminEntity uploadedBy, LocalDateTime uploadedAt){
        this.resourceId = resourceId;
        this.title = title;
        this.contentType = contentType;
        this.isOfflineAvailable = isOfflineAvailable;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
    }


    public int getResourceId(){
        return resourceId;
    }

    public void setResourceId(int resourceId){
        this.resourceId = resourceId;
    }

    public String getTitle(){
        return title;
    }

    public void setTitle(String title){
        this.title = title;
    }

    public String getContentType(){
        return contentType;
    }

    public void setContentType(String contentType){
        this.contentType = contentType;
    }

    public boolean getIsOfflineAvailable(){
        return isOfflineAvailable;
    }

    public void setIsOfflineAvailable(boolean isOfflineAvailable){
        this.isOfflineAvailable = isOfflineAvailable;
    }

    public AdminEntity getUploadedBy(){
        return uploadedBy;
    }

    public void setUploadedBy(AdminEntity uploadedBy){
        this.uploadedBy = uploadedBy;
    }


    public LocalDateTime getUploadedAt(){
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt){
        this.uploadedAt = uploadedAt;
    }

}


