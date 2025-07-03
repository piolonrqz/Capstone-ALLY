package com.wachichaw.AI.Entity;

public class LawyerRecommendationRequest {
    private String caseType;
    private String urgencyLevel;
    private String preferredExperience;
    private String location;
    
    public LawyerRecommendationRequest() {
    }

    public LawyerRecommendationRequest(String caseType, String urgencyLevel, String preferredExperience, String location) {
        this.caseType = caseType;
        this.urgencyLevel = urgencyLevel;
        this.preferredExperience = preferredExperience;
        this.location = location;
    }

    public String getCaseType() {
        return caseType;
    }

    public void setCaseType(String caseType) {
        this.caseType = caseType;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public String getPreferredExperience() {
        return preferredExperience;
    }

    public void setPreferredExperience(String preferredExperience) {
        this.preferredExperience = preferredExperience;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
