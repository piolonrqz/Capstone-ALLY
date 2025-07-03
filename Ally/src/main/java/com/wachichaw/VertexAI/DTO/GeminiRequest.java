package com.wachichaw.VertexAI.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Basic request for generating content")
public class GeminiRequest {
    @Schema(description = "The text prompt to generate content from", 
            example = "Write a short story about a robot learning to paint")
    private String prompt;
    
    public GeminiRequest() {}
    
    public GeminiRequest(String prompt) {
        this.prompt = prompt;
    }
    
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
}