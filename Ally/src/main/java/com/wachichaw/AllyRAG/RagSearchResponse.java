package com.wachichaw.AllyRAG;

import lombok.Data;
import java.util.List;

@Data
public class RagSearchResponse {
    private List<LegalCase> cases;
    private Integer count;
    private String query;
}
