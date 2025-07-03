package com.wachichaw.VertexAI.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.VertexAI;
import com.wachichaw.VertexAI.DTO.GeminiAdvancedRequest;
import com.wachichaw.VertexAI.DTO.GeminiRequest;
import com.wachichaw.VertexAI.DTO.GeminiResponse;
import com.wachichaw.VertexAI.Service.GeminiService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/gemini")
@Tag(name = "Gemini AI", description = "Fine-tuned Gemini Flash 2.0 API endpoints")
public class GeminiController {
    
    private final GeminiService geminiService;
    private final VertexAI vertexAI;
    
    public GeminiController(GeminiService geminiService, VertexAI vertexAI) {
        this.geminiService = geminiService;
        this.vertexAI = vertexAI;
    }
    
    @PostMapping("/generate")
    @Operation(summary = "Generate content with basic prompt", 
               description = "Generate content using your fine-tuned Gemini model with a simple text prompt")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Content generated successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<GeminiResponse> generateContent(
            @RequestBody @Parameter(description = "Prompt request containing the text to generate from") 
            GeminiRequest request) {
        try {
            String response = geminiService.generateContent(request.getPrompt());
            return ResponseEntity.ok(new GeminiResponse(response, "success"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new GeminiResponse(null, "Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/generate-advanced")
    @Operation(summary = "Generate content with advanced configuration", 
               description = "Generate content with custom temperature, topP, and token limits")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Content generated successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<GeminiResponse> generateContentAdvanced(
            @RequestBody @Parameter(description = "Advanced request with prompt and generation parameters") 
            GeminiAdvancedRequest request) {
        try {
            GenerationConfig config = GenerationConfig.newBuilder()
                    .setTemperature(request.getTemperature())
                    .setTopP(request.getTopP())
                    .setMaxOutputTokens(request.getMaxOutputTokens())
                    .build();
            
            String response = geminiService.generateContentWithConfig(request.getPrompt(), config);
            return ResponseEntity.ok(new GeminiResponse(response, "success"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new GeminiResponse(null, "Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the Gemini service is running")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Gemini service is running!");
    }

    @GetMapping("/test-auth")
    @Operation(summary = "Test authentication", description = "Test if VertexAI credentials are working")
    public ResponseEntity<String> testAuth() {
        try {
            // Test if credentials work
            return ResponseEntity.ok("Authentication successful with project: " + 
                                    vertexAI.getProjectId() + " in location: " + vertexAI.getLocation());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Auth failed: " + e.getMessage());
        }
    }
}