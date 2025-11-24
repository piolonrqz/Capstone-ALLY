package com.wachichaw.AllyChatAI.Controller;

import com.wachichaw.AllyChatAI.Service.GeminiChatService;
import com.wachichaw.AllyRAG.*;

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

    @Value("${rag.relevance.threshold:54.0}")
    private double relevanceThreshold;

    @Autowired
    private LegalQuestionValidator validator;

    @PostMapping("/prompt")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setRagEnabled(request.isUseRAG());
        chatResponse.setTimestamp(LocalDateTime.now().toString());

        System.out.println("\n" + "=".repeat(60));
        System.out.println("📝 Received message: " + request.getMessage());
        System.out.println("🔍 RAG enabled: " + request.isUseRAG());
        
        String enhancedPrompt = request.getMessage();

        // ==========================================
        // STAGE 1: Python Gemini Validation (FIRST!)
        // ==========================================
        System.out.println("🔍 Stage 1: Running Python Gemini validation...");
        ValidationResponse pythonValidation = ragService.validateQuestion(request.getMessage());
        
        if (pythonValidation != null && pythonValidation.getIsValid() != null && !pythonValidation.getIsValid()) {
            System.out.println("❌ REJECTED by Gemini classifier (" + pythonValidation.getMethod() + ")");
            System.out.println("   Reason: " + pythonValidation.getRejectionReason());
            System.out.println("   Confidence: " + pythonValidation.getConfidence());
            System.out.println("=".repeat(60) + "\n");
            
            // USE THE PYTHON MESSAGE DIRECTLY - DON'T OVERRIDE IT!
            chatResponse.setResponse(pythonValidation.getRejectionReason());
            chatResponse.setRelevantCases(null);
            chatResponse.setCaseCount(0);
            chatResponse.setConfidence("Rejected - Gemini");
            
            return ResponseEntity.badRequest().body(chatResponse);
        }
        
        System.out.println("✅ PASSED Gemini validation (Stage 1)");
        if (pythonValidation != null && pythonValidation.getConfidence() != null) {
            System.out.println("   Confidence: " + String.format("%.3f", pythonValidation.getConfidence()));
        }

        // ==========================================
        // STAGE 2: Basic Java Validation (Length only)
        // ==========================================
        LegalQuestionValidator.ValidationResult javaValidation = validator.validate(request.getMessage());

        if (!javaValidation.isValid()) {
            System.out.println("❌ REJECTED by Java validator: " + javaValidation.getMessage());
            System.out.println("=".repeat(60) + "\n");
            
            chatResponse.setResponse(javaValidation.getMessage());
            chatResponse.setRelevantCases(null);
            chatResponse.setCaseCount(0);
            chatResponse.setConfidence("Rejected - Length");
            
            return ResponseEntity.badRequest().body(chatResponse);
        }

        System.out.println("✅ PASSED basic validation (Stage 2)");
        
        // ==========================================
        // Check if greeting/meta - skip RAG
        // ==========================================
        if (isGreetingOrMetaQuestion(request.getMessage())) {
            System.out.println("💬 Greeting/Meta question detected - skipping RAG");
            request.setUseRAG(false);
        }
        
        // ==========================================
        // STAGE 3: RAG Processing (if enabled)
        // ==========================================
        if (request.isUseRAG()) {
            System.out.println("🔍 RAG enabled - calling Python service...");
            
            RagSearchResponse ragResults = ragService.searchRelevantCases(request.getMessage(), 3);
            
            if (ragResults != null && ragResults.getRejected() != null && ragResults.getRejected()) {
                System.out.println("❌ REJECTED by RAG (" + ragResults.getRejectionStage() + ")");
                System.out.println("   Reason: " + ragResults.getRejectionReason());
                System.out.println("=".repeat(60) + "\n");
                
                String rejectionMessage;
                
                switch (ragResults.getRejectionStage() != null ? ragResults.getRejectionStage() : "") {
                    case "gemini_filter":
                        rejectionMessage = "❌ " + ragResults.getRejectionReason() + "\n\n" +
                            "💡 I specialize in Philippine law. Please ask about:\n" +
                            "• Legal rights and obligations\n" +
                            "• Court cases and procedures\n" +
                            "• Philippine laws and regulations\n" +
                            "• Legal remedies and penalties";
                        break;
                    
                    case "no_results":
                        rejectionMessage = "❌ No relevant Supreme Court cases found.\n\n" +
                            "💡 Try:\n" +
                            "• Rephrasing with more general legal terms\n" +
                            "• Adding more context about your situation\n" +
                            "• Specifying the legal area (labor, criminal, civil, etc.)";
                        break;
                    
                    case "low_relevance":
                        rejectionMessage = "❌ Cases found but relevance too low.\n\n" +
                            "To get better results:\n" +
                            "• Use specific legal terms (e.g., 'illegal dismissal' vs 'fired unfairly')\n" +
                            "• Add more details about your situation\n" +
                            "• Specify the legal area involved\n\n" +
                            "💡 The more detailed your question, the better I can help!";
                        break;
                    
                    default:
                        rejectionMessage = "❌ " + ragResults.getRejectionReason() + "\n\n" +
                            "💡 Please rephrase with more legal context.";
                }
                
                chatResponse.setResponse(rejectionMessage);
                chatResponse.setRelevantCases(null);
                chatResponse.setCaseCount(0);
                chatResponse.setConfidence("Rejected - " + ragResults.getRejectionStage());
                
                return ResponseEntity.badRequest().body(chatResponse);
            }
            
            System.out.println("✅ PASSED RAG validation");
            
            if (ragResults != null && ragResults.getCases() != null && !ragResults.getCases().isEmpty()) {
                
                List<LegalCase> relevantCases = ragResults.getCases().stream()
                    .filter(c -> c.getScore() != null && c.getScore() >= relevanceThreshold)
                    .collect(Collectors.toList());
                
                System.out.println("📊 Found " + ragResults.getCases().size() + " cases total");
                System.out.println("📊 " + relevantCases.size() + " cases above " + relevanceThreshold + "% threshold");
                
                if (!relevantCases.isEmpty()) {
                    chatResponse.setRelevantCases(relevantCases);
                    chatResponse.setCaseCount(relevantCases.size());
                    
                    double topScore = relevantCases.get(0).getScore();
                    chatResponse.setConfidence(String.format("%.0f%%", topScore));
                    
                    System.out.println("✅ Top case relevance: " + String.format("%.1f%%", topScore));
                    
                    StringBuilder contextBuilder = new StringBuilder();
                    contextBuilder.append("Based on the following relevant Philippine Supreme Court cases:\n\n");
                    
                    for (int i = 0; i < relevantCases.size(); i++) {
                        LegalCase legalCase = relevantCases.get(i);
                        
                        System.out.println("   📄 Case " + (i+1) + ": " + legalCase.getTitle() + 
                                        " (" + String.format("%.1f%%", legalCase.getScore()) + ")");
                        
                        contextBuilder.append(String.format("[CASE %d] %s (Relevance: %.1f%%)\n", 
                            i + 1, legalCase.getTitle(), legalCase.getScore()));
                        
                        if (legalCase.getCitation() != null && !legalCase.getCitation().isEmpty()) {
                            contextBuilder.append(String.format("Citation: %s\n", legalCase.getCitation()));
                        }
                        
                        if (legalCase.getSection() != null && !legalCase.getSection().isEmpty()) {
                            contextBuilder.append(String.format("Section: %s\n", legalCase.getSection()));
                        }
                        
                        String content = legalCase.getContent();
                        if (content != null && content.length() > 800) {
                            content = content.substring(0, 800) + "...";
                        }
                        contextBuilder.append(String.format("Content: %s\n\n", content != null ? content : ""));
                    }
                    
                    contextBuilder.append("User Question: ").append(request.getMessage());
                    contextBuilder.append("\n\n");
                    contextBuilder.append("INSTRUCTIONS:\n");
                    contextBuilder.append("Please answer the user's question using the above Supreme Court cases as reference. ");
                    contextBuilder.append("Cite specific cases using [Case 1], [Case 2] format in your response. ");
                    contextBuilder.append("Provide a clear answer with legal basis and practical implications. ");
                    contextBuilder.append("End with the disclaimer: '⚠️ This is legal information, not legal advice. ");
                    contextBuilder.append("For your specific situation, please consult a qualified Philippine lawyer.'");
                    
                    enhancedPrompt = contextBuilder.toString();
                    
                    System.out.println("✅ Enhanced prompt built with " + relevantCases.size() + " cases");
                    
                } else {
                    System.out.println("⚠️  No cases above threshold - providing guidance");
                    
                    chatResponse.setRelevantCases(null);
                    chatResponse.setCaseCount(0);
                    chatResponse.setConfidence("Low relevance");
                    
                    enhancedPrompt = String.format(
                        "⚠️ I searched my database but couldn't find cases closely matching your question.\n\n" +
                        "Your question: %s\n\n" +
                        "For better case references, please:\n" +
                        "• Add more specific details\n" +
                        "• Specify the legal area (labor, criminal, civil, family)\n" +
                        "• Use legal terms if you know them\n\n" +
                        "I'll still provide general legal information, but with more details, " +
                        "I can find relevant Supreme Court cases to support my answer.\n\n" +
                        "Please provide a general answer anyway, noting no specific cases were found.",
                        request.getMessage()
                    );
                }
                
            } else {
                System.out.println("⚠️  No cases found");
                
                chatResponse.setRelevantCases(null);
                chatResponse.setCaseCount(0);
                chatResponse.setConfidence(null);
                
                enhancedPrompt = String.format(
                    "⚠️ No legal cases found in the database.\n\n" +
                    "User Question: %s\n\n" +
                    "INSTRUCTIONS:\n" +
                    "Provide a general answer based on Philippine law knowledge, but inform the user:\n" +
                    "1. No specific Supreme Court cases were found\n" +
                    "2. They should verify with a qualified lawyer\n" +
                    "3. Suggest rephrasing with more specific legal terms\n\n" +
                    "Be helpful but cautious.",
                    request.getMessage()
                );
            }
            
            System.out.println("=".repeat(60) + "\n");
            
        } else {
            System.out.println("ℹ️  RAG not enabled - direct to Gemini");
            System.out.println("=".repeat(60) + "\n");
        }
        
        System.out.println("Sending to Gemini...");
        String response = geminiChatService.sendMessage(enhancedPrompt);
        chatResponse.setResponse(response);
        System.out.println("Response generated (" + response.length() + " chars)");
        
        return ResponseEntity.ok(chatResponse);
    }

    private boolean isGreetingOrMetaQuestion(String message) {
        if (message == null || message.trim().isEmpty()) {
            return false;
        }
        
        String lower = message.toLowerCase().trim();
        
        if (lower.length() <= 30) {
            String[] greetings = {
                "hi", "hello", "hey", "sup", 
                "good morning", "good afternoon", "good evening",
                "how are you", "what's up", "whats up"
            };
            
            for (String greeting : greetings) {
                if (lower.matches("^" + greeting + "\\s*[.!?]*$")) {
                    return true;
                }
            }
        }
        
        if (lower.contains("ally") && 
            (lower.contains("who") || lower.contains("what") || 
             lower.contains("why") || lower.contains("how"))) {
            return true;
        }
        
        if (lower.matches("(?i).*(who|what).*(you|your|this bot|this assistant).*")) {
            return true;
        }
        
        if (lower.matches("(?i).*(your|the)\\s+(name|creator|developer|team|purpose|project).*")) {
            return true;
        }
        
        if (lower.contains("capstone") || lower.contains("thesis") || 
            (lower.contains("school") && lower.contains("project"))) {
            return true;
        }
        
        return false;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "running");
        health.put("ragService", ragService.isRagServiceHealthy() ? "running" : "down");
        health.put("relevanceThreshold", relevanceThreshold + "%");
        health.put("classifier", "Gemini Flash");
        return ResponseEntity.ok(health);
    }

    @GetMapping("/reset")
    public ResponseEntity<String> resetChat() {
        geminiChatService.resetHistory();
        return ResponseEntity.ok("🔄 Chat history reset.");
    }
}