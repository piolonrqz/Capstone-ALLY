package com.wachichaw.AllyRAG;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private boolean useRAG = false;  // Default to false
}