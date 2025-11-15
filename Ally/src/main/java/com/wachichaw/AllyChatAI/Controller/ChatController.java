package com.wachichaw.AllyChatAI.Controller;

import com.wachichaw.AllyChatAI.Service.GeminiChatService;
import com.wachichaw.AllyRAG.ChatRequest;
import com.wachichaw.AllyRAG.ChatResponse;
import com.wachichaw.AllyRAG.RagService;
import com.wachichaw.AllyRAG.RagSearchResponse;
import com.wachichaw.AllyRAG.LegalCase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private GeminiChatService geminiChatService;

    @Autowired
    private RagService ragService;

    // NEW: Configurable threshold
    @Value("${rag.relevance.threshold:54.0}")
    private double relevanceThreshold;

    @PostMapping("/prompt")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setRagEnabled(request.isUseRAG());
        chatResponse.setTimestamp(LocalDateTime.now().toString());

        String enhancedPrompt = request.getMessage();
        
        // If RAG is enabled, search for relevant cases first
        if (request.isUseRAG()) {
            System.out.println("RAG enabled - searching for relevant cases...");
            
            RagSearchResponse ragResults = ragService.searchRelevantCases(request.getMessage(), 3);
            
            if (ragResults != null && ragResults.getCases() != null && !ragResults.getCases().isEmpty()) {
                
                // NEW: Filter cases by threshold (54%)
                List<LegalCase> relevantCases = ragResults.getCases().stream()
                    .filter(c -> c.getScore() != null && c.getScore() >= relevanceThreshold)
                    .collect(Collectors.toList());
                
                System.out.println("Found " + ragResults.getCases().size() + " cases, " + 
                                   relevantCases.size() + " above " + relevanceThreshold + "% threshold");
                
                if (!relevantCases.isEmpty()) {
                    // Cases found above threshold
                    chatResponse.setRelevantCases(relevantCases);
                    chatResponse.setCaseCount(relevantCases.size());
                    
                    // Set confidence based on top score
                    double topScore = relevantCases.get(0).getScore();
                    chatResponse.setConfidence(String.format("%.0f%%", topScore));
                    
                    // Enhance prompt with context from relevant cases
                    StringBuilder contextBuilder = new StringBuilder();
                    contextBuilder.append("Based on the following relevant Philippine legal cases:\n\n");
                    
                    for (int i = 0; i < relevantCases.size(); i++) {
                        LegalCase legalCase = relevantCases.get(i);
                        contextBuilder.append(String.format("[CASE %d] %s (Relevance: %.1f%%)\n", 
                            i + 1, legalCase.getTitle(), legalCase.getScore()));
                        
                        if (legalCase.getCitation() != null) {
                            contextBuilder.append(String.format("Citation: %s\n", legalCase.getCitation()));
                        }
                        
                        // Truncate content if too long
                        String content = legalCase.getContent();
                        if (content.length() > 800) {
                            content = content.substring(0, 800) + "...";
                        }
                        contextBuilder.append(String.format("Content: %s\n\n", content));
                    }
                    
                    contextBuilder.append("User Question: ").append(request.getMessage());
                    contextBuilder.append("\n\nPlease answer the user's question using the above case law as reference. " +
                                         "Cite the specific cases in your response.");
                    
                    enhancedPrompt = contextBuilder.toString();
                    
                } else {
                    // NEW: No cases above threshold - inform user
                    System.out.println("No cases above threshold. Prompting user for clarification.");
                    
                    chatResponse.setRelevantCases(null);
                    chatResponse.setCaseCount(0);
                    chatResponse.setConfidence("Low relevance");
                    
                    enhancedPrompt = String.format(
                        "⚠️ I searched my legal database but couldn't find cases that closely match your question.\n\n" +
                        "Your question: %s\n\n" +
                        "To provide more accurate case references, please:\n" +
                        "• Provide more specific details about your legal concern\n" +
                        "• Include relevant facts, dates, or circumstances\n" +
                        "• Specify the legal area (e.g., labor law, criminal law, family law)\n" +
                        "• Use specific legal terms if you know them\n\n" +
                        "I'll still provide general legal information based on my training, but with more details, " +
                        "I can find relevant Philippine case law to support my answer.\n\n" +
                        "Please provide a general answer to their question anyway, but note the limitation.",
                        request.getMessage()
                    );
                }
            } else {
                // No cases found in database at all
                System.out.println("No cases found in database");
                
                chatResponse.setRelevantCases(null);
                chatResponse.setCaseCount(0);
                chatResponse.setConfidence(null);
                
                enhancedPrompt = String.format(
                    "⚠️ No legal cases found in the database for this query.\n\n" +
                    "User Question: %s\n\n" +
                    "Provide a general answer based on your training, but inform the user that " +
                    "no specific case law was found and suggest they rephrase their question with more details.",
                    request.getMessage()
                );
            }
        }
        
        // Send to Gemini (with or without RAG context)
        String response = geminiChatService.sendMessage(enhancedPrompt);
        chatResponse.setResponse(response);
        
        return ResponseEntity.ok(chatResponse);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "running");
        health.put("ragService", ragService.isRagServiceHealthy() ? "running" : "down");
        health.put("relevanceThreshold", relevanceThreshold + "%");
        return ResponseEntity.ok(health);
    }

    @GetMapping("/reset")
    public ResponseEntity<String> resetChat() {
        geminiChatService.resetHistory();
        return ResponseEntity.ok("🔄 Chat history reset.");
    }
}