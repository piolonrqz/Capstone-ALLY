package com.wachichaw.AllyChatAI.Controller;

import com.wachichaw.AllyChatAI.Service.GeminiChatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "ALLY Chat", description = "Chat endpoint for interacting with ALLY fine-tuned Gemini model")
public class ChatController {

    @Autowired
    private GeminiChatService geminiChatService;

    @PostMapping("/prompt")
    @Operation(
        summary = "Send a message to ALLY chatbot",
        description = "Send a message prompt and receive a response from the fine-tuned Gemini Flash 2.0 model"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Response generated successfully"),
        @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<String> chat(
            @RequestBody 
            @Parameter(description = "Payload with a single 'message' key", 
                       required = true,
                       schema = @Schema(example = "{\"message\": \"Hello, ALLY!\"}"))
            Map<String, String> payload) {
        
        String prompt = payload.get("message");
        String response = geminiChatService.sendMessage(prompt);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the ALLY 2.0 - Gemini service is running")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("ALLY 2.0 - Gemini service is running!");
    }

    @GetMapping("/reset")
    public ResponseEntity<String> resetChat() {
        geminiChatService.resetHistory();
        return ResponseEntity.ok("🔄 Chat history reset.");
    }
}
