package com.wachichaw.Weka.Entity;

import com.wachichaw.Lawyer.Entity.LawyerEntity;

public class LawyerRecommendationResponse {
    private LawyerEntity lawyer;
    private Double matchScore;
    private String matchReason;
    private Integer rank;

    public LawyerRecommendationResponse() {
    }

    public LawyerRecommendationResponse(LawyerEntity lawyer, Double matchScore, String matchReason, Integer rank) {
        this.lawyer = lawyer;
        this.matchScore = matchScore;
        this.matchReason = matchReason;
        this.rank = rank;
    }

    public LawyerEntity getLawyer() {
        return lawyer;
    }

    public void setLawyer(LawyerEntity lawyer) {
        this.lawyer = lawyer;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}
