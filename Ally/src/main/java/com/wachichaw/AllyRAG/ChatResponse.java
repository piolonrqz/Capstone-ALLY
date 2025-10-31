package com.wachichaw.AllyRAG;

import lombok.Data;
import java.util.List;

@Data
public class ChatResponse {
    private String response;
    private List<LegalCase> relevantCases;
    private Integer caseCount;
    private String confidence;
    private boolean ragEnabled;
    private String timestamp;
}