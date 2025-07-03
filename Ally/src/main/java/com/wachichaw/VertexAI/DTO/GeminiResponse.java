package com.wachichaw.VertexAI.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response containing generated content")
public class GeminiResponse {
    @Schema(description = "The generated content from the AI model", 
            example = "Once upon a time, there was a curious robot named Pixel...")
    private String content;
    
    @Schema(description = "Status of the request", 
            example = "success")
    private String status;
    
    public GeminiResponse() {}
    
    public GeminiResponse(String content, String status) {
        this.content = content;
        this.status = status;
    }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}