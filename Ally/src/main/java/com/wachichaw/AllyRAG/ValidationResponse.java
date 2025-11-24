package com.wachichaw.AllyRAG;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ValidationResponse {
    @JsonProperty("is_valid")
    private Boolean valid;
    
    @JsonProperty("rejection_reason")
    private String rejectionReason;
    
    @JsonProperty("confidence")
    private Double confidence;
    
    @JsonProperty("method")
    private String method;

    public Boolean getValid() {
        return valid;
    }
    
    public Boolean getIsValid() {
        return valid;
    }
}