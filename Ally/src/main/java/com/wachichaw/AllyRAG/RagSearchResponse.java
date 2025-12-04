package com.wachichaw.AllyRAG;

import lombok.Data;
import java.util.List;

@Data
public class RagSearchResponse {
    private List<LegalCase> cases;
    private Integer count;
    private String query;

    private Boolean rejected = false;
    private String rejectionStage;
    private String rejectionReason;
    private Double confidence;
}
