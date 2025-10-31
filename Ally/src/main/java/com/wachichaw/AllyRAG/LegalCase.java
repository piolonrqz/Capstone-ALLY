package com.wachichaw.AllyRAG;

import lombok.Data;

@Data
public class LegalCase {
    private String title;
    private Double score;
    private String content;
    private String citation;
    private String section;
}