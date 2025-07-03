package com.wachichaw.VertexAI.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Advanced request with generation parameters")
public class GeminiAdvancedRequest {
    @Schema(description = "The text prompt to generate content from", 
            example = "Explain quantum computing in simple terms")
    private String prompt;
    
    @Schema(description = "Controls randomness in generation (0.0-1.0)", 
            example = "0.7", minimum = "0.0", maximum = "1.0")
    private float temperature = 0.9f;
    
    @Schema(description = "Controls diversity via nucleus sampling (0.0-1.0)", 
            example = "0.95", minimum = "0.0", maximum = "1.0")
    private float topP = 0.95f;
    
    @Schema(description = "Maximum number of tokens to generate", 
            example = "1000", minimum = "1")
    private int maxOutputTokens = 8192;
    
    public GeminiAdvancedRequest() {}
    
    // Getters and setters
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    
    public float getTemperature() { return temperature; }
    public void setTemperature(float temperature) { this.temperature = temperature; }
    
    public float getTopP() { return topP; }
    public void setTopP(float topP) { this.topP = topP; }
    
    public int getMaxOutputTokens() { return maxOutputTokens; }
    public void setMaxOutputTokens(int maxOutputTokens) { this.maxOutputTokens = maxOutputTokens; }
}
