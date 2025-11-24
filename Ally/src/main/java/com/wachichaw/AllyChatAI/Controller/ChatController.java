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
        // STAGE 1: Python ML Validation (FIRST!)
        // ==========================================
        System.out.println("🔍 Stage 1: Running Python ML validation...");
        ValidationResponse pythonValidation = ragService.validateQuestion(request.getMessage());
        
        // DEBUG: Print what we received
        System.out.println("   DEBUG: pythonValidation = " + pythonValidation);
        if (pythonValidation != null) {
            System.out.println("   DEBUG: pythonValidation.getValid() = " + pythonValidation.getValid());
            System.out.println("   DEBUG: pythonValidation.getIsValid() = " + pythonValidation.getIsValid());
        }
        
        // Check if validation failed - using getIsValid() to match Python's "is_valid"
        if (pythonValidation != null && pythonValidation.getIsValid() != null && !pythonValidation.getIsValid()) {
            System.out.println("❌ REJECTED by Python ML filter (" + pythonValidation.getMethod() + ")");
            System.out.println("   Reason: " + pythonValidation.getRejectionReason());
            System.out.println("   Confidence: " + pythonValidation.getConfidence());
            System.out.println("=".repeat(60) + "\n");
            
            chatResponse.setResponse(pythonValidation.getRejectionReason());
            chatResponse.setRelevantCases(null);
            chatResponse.setCaseCount(0);
            chatResponse.setConfidence("Rejected - ML Filter");
            
            return ResponseEntity.badRequest().body(chatResponse);
        }
        
        System.out.println("✅ PASSED Python ML validation (Stage 1)");
        if (pythonValidation != null && pythonValidation.getConfidence() != null) {
            System.out.println("   ML confidence: " + String.format("%.3f", pythonValidation.getConfidence()));
        }

        // ==========================================
        // STAGE 2: Java Keyword Validation (Backup)
        // ==========================================
        LegalQuestionValidator.ValidationResult javaValidation = validator.validate(request.getMessage());
        
        if (!javaValidation.isValid()) {
            System.out.println("❌ REJECTED by Java keyword validator: " + javaValidation.getMessage());
            System.out.println("=".repeat(60) + "\n");
            
            chatResponse.setResponse(
                "❌ " + javaValidation.getMessage() + "\n\n" +
                "💡 **Examples of questions I can answer:**\n" +
                "• Can I sue my landlord for illegal eviction?\n" +
                "• What are the requirements to file a criminal case?\n" +
                "• How do I file for annulment of marriage?\n" +
                "• What are my rights as a tenant in the Philippines?\n" +
                "• How long do I have to file a labor complaint?\n" +
                "• What is the penalty for breach of contract?"
            );
            chatResponse.setRelevantCases(null);
            chatResponse.setCaseCount(0);
            chatResponse.setConfidence("Rejected - Java Filter");
            
            return ResponseEntity.badRequest().body(chatResponse);
        }

        System.out.println("✅ PASSED Java keyword validation (Stage 2)");
        
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
                System.out.println("❌ REJECTED by Python RAG (" + ragResults.getRejectionStage() + ")");
                System.out.println("   Reason: " + ragResults.getRejectionReason());
                System.out.println("=".repeat(60) + "\n");
                
                String rejectionMessage;
                
                switch (ragResults.getRejectionStage() != null ? ragResults.getRejectionStage() : "") {
                    case "ml_filter":
                        rejectionMessage = "❌ " + ragResults.getRejectionReason() + "\n\n" +
                            "💡 This question doesn't appear to be about Philippine law. Please ask about:\n" +
                            "• Legal rights and obligations\n" +
                            "• Court cases and procedures\n" +
                            "• Philippine laws and regulations\n" +
                            "• Legal remedies and penalties";
                        break;
                    
                    case "no_results":
                        rejectionMessage = "❌ No relevant Supreme Court cases found in our database.\n\n" +
                            "This could mean:\n" +
                            "• Your question is too specific or niche\n" +
                            "• The topic isn't well-covered in our case database\n" +
                            "• Try rephrasing with more general legal terms\n\n" +
                            "💡 Example: Instead of asking about a very specific situation, " +
                            "ask about the general legal principle involved.";
                        break;
                    
                    case "low_relevance":
                        rejectionMessage = "❌ Found cases but relevance is too low.\n\n" +
                            "Your question: " + request.getMessage() + "\n\n" +
                            "To get better results:\n" +
                            "• Add more context about your situation\n" +
                            "• Use specific legal terms (e.g., 'illegal dismissal' instead of 'fired unfairly')\n" +
                            "• Specify the legal area (labor law, criminal law, civil law, etc.)\n" +
                            "• Include relevant facts or circumstances\n\n" +
                            "💡 The more detailed your question, the better I can find relevant cases.";
                        break;
                    
                    default:
                        rejectionMessage = "❌ " + ragResults.getRejectionReason() + "\n\n" +
                            "💡 Please rephrase your question with more legal context.";
                }
                
                chatResponse.setResponse(rejectionMessage);
                chatResponse.setRelevantCases(null);
                chatResponse.setCaseCount(0);
                chatResponse.setConfidence("Rejected - " + ragResults.getRejectionStage());
                
                return ResponseEntity.badRequest().body(chatResponse);
            }
            
            System.out.println("✅ PASSED Python RAG validation (Stages 3-4)");
            
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
                        "⚠️ I searched my legal database but couldn't find cases that closely match your question.\n\n" +
                        "Your question: %s\n\n" +
                        "To provide more accurate case references, please:\n" +
                        "• Provide more specific details about your legal concern\n" +
                        "• Include relevant facts, dates, or circumstances\n" +
                        "• Specify the legal area (e.g., labor law, criminal law, civil law, family law)\n" +
                        "• Use specific legal terms if you know them (e.g., 'illegal dismissal', 'breach of contract')\n\n" +
                        "I'll still provide general legal information based on my training, but with more details, " +
                        "I can find relevant Philippine Supreme Court cases to support my answer.\n\n" +
                        "Please provide a general answer to their question anyway, but clearly note that " +
                        "no specific case law was found and suggest they provide more details for better results.",
                        request.getMessage()
                    );
                }
                
            } else {
                System.out.println("⚠️  No cases found in database");
                
                chatResponse.setRelevantCases(null);
                chatResponse.setCaseCount(0);
                chatResponse.setConfidence(null);
                
                enhancedPrompt = String.format(
                    "⚠️ No legal cases found in the database for this query.\n\n" +
                    "User Question: %s\n\n" +
                    "INSTRUCTIONS:\n" +
                    "Provide a general answer based on your knowledge of Philippine law, but clearly inform the user that:\n" +
                    "1. No specific Supreme Court cases were found in the database\n" +
                    "2. They should verify this information with a qualified lawyer\n" +
                    "3. Suggest they rephrase their question with more specific legal terms\n\n" +
                    "Be helpful but cautious, and emphasize the importance of consulting a lawyer.",
                    request.getMessage()
                );
            }
            
            System.out.println("=".repeat(60) + "\n");
            
        } else {
            System.out.println("ℹ️  RAG not enabled - sending directly to Gemini");
            System.out.println("=".repeat(60) + "\n");
        }
        
        System.out.println("Sending to Gemini for answer generation...");
        String response = geminiChatService.sendMessage(enhancedPrompt);
        chatResponse.setResponse(response);
        System.out.println("Response generated (" + response.length() + " characters)");
        
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
        health.put("validationOrder", "1:Python-ML 2:Java-Keyword");
        return ResponseEntity.ok(health);
    }

    @GetMapping("/reset")
    public ResponseEntity<String> resetChat() {
        geminiChatService.resetHistory();
        return ResponseEntity.ok("🔄 Chat history reset.");
    }
}