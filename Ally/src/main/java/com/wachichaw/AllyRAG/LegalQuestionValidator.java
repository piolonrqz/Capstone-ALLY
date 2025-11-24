package com.wachichaw.AllyRAG;

import org.springframework.stereotype.Component;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class LegalQuestionValidator {
    
    // Strong legal indicators
    private static final Set<String> STRONG_LEGAL_KEYWORDS = Set.of(
        // Legal actions
        "sue", "file", "report", "complain", "appeal", "petition", "claim",
        
        // Harm/violations
        "harassment", "harass", "assault", "abuse", "discrimination", 
        "violation", "liability", "negligence", "fraud", "scam", "damages", 
        "penalty", "fine", "theft", "robbery", "murder", "rape",
        
        // Legal entities
        "court", "judge", "lawyer", "attorney", "police", "barangay",
        "fiscal", "ombudsman", "prosecutor", "notary",
        
        // Legal processes
        "case", "complaint", "affidavit", "evidence", "witness", "bail",
        "warrant", "subpoena", "verdict", "ruling", "jurisdiction", "hearing",
        
        // Rights and obligations
        "rights", "obligation", "duty", "contract", "agreement", "lease",
        
        // Legal areas
        "criminal", "civil", "labor", "administrative", "family",
        "property", "employment", "tenant", "landlord", "eviction",
        "annulment", "divorce", "custody", "inheritance", "dismissal"
    );
    
    // Meta questions about ALLY (always allow)
    private static final Pattern[] ALLY_META_PATTERNS = {
        Pattern.compile("(?i)\\b(who|what|why|how).*\\b(ally|you|your|this|project|system|bot|assistant)\\b"),
        Pattern.compile("(?i)\\b(created|made|developed|built|designed).*\\b(ally|you|this)\\b"),
        Pattern.compile("(?i)\\bally\\s+(stand|mean|do|help|work)"),
        Pattern.compile("(?i)\\b(your|the)\\s+(creator|developer|team|purpose|name)\\b"),
        Pattern.compile("(?i)\\b(capstone|project|thesis|school)\\b")
    };
    
    // Clearly off-topic patterns (block these)
    private static final Pattern[] OFF_TOPIC_PATTERNS = {
        // Recipes and cooking (unless about food business law)
        Pattern.compile("(?i)\\b(recipe|ingredient|cooking|baking|cook)\\b(?!.*(business|permit|license|health|safety|law))"),
        
        // Weather
        Pattern.compile("(?i)\\b(weather|temperature|forecast|rain|sunny|cloudy)\\b(?!.*(disaster|calamity|force majeure|insurance|law))"),
        
        // Pure entertainment queries
        Pattern.compile("(?i)^.*(tell me a joke|make me laugh|something funny).*$"),
        Pattern.compile("(?i)\\b(movie recommendation|good movie|watch.*movie)\\b(?!.*(piracy|copyright|contract))"),
        Pattern.compile("(?i)\\b(song recommendation|good song|music playlist)\\b(?!.*(copyright|royalty))"),
        
        // Gaming (unless about legal aspects)
        Pattern.compile("(?i)\\b(play.*game|gaming|video game|esports|dota|mobile legends|valorant)\\b(?!.*(law|legal|scam|fraud|gambling|addiction|violence))"),
        
        // Math homework (unless computing legal amounts)
        Pattern.compile("(?i)\\b(solve.*equation|calculate.*math|homework.*algebra)\\b"),
        
        // Programming (unless about cyber law)
        Pattern.compile("(?i)\\b(write.*code|debug.*program|python.*function)\\b(?!.*(law|legal|cyber|data privacy))"),
        
        // Medical diagnosis (unless malpractice)
        Pattern.compile("(?i)\\b(diagnose|symptom|prescription|medicine for)\\b(?!.*(malpractice|negligence|liability))")
    };
    
    public ValidationResult validate(String question) {
        if (question == null || question.trim().isEmpty()) {
            return new ValidationResult(false, "Question cannot be empty");
        }
        
        String questionLower = question.toLowerCase().trim();
        
        // Remove length restrictions - allow short and long messages
        if (questionLower.length() > 2000) {
            return new ValidationResult(false, 
                "Your message is too long. Please keep it under 2000 characters.");
        }
        
        // ALWAYS allow greetings and ALLY meta-questions
        if (isGreetingOrMeta(questionLower)) {
            return new ValidationResult(true, null);
        }
        
        // ALWAYS allow if strong legal keyword present
        boolean hasStrongLegalKeyword = STRONG_LEGAL_KEYWORDS.stream()
            .anyMatch(questionLower::contains);
        
        if (hasStrongLegalKeyword) {
            return new ValidationResult(true, null);
        }
        
        // Check for clearly off-topic content
        for (Pattern pattern : OFF_TOPIC_PATTERNS) {
            if (pattern.matcher(questionLower).find()) {
                return new ValidationResult(false, 
                    "I specialize in Philippine legal matters and information about ALLY. " +
                    "I can't help with recipes, weather, entertainment recommendations, or homework. " +
                    "Please ask about law, your legal rights, or about the ALLY project.");
            }
        }
        
        // If we reach here, it's either:
        // 1. A casual conversation (allow it - let Gemini handle)
        // 2. A vague question (allow it - let RAG stages 2-3 filter)
        // 3. A legal question without strong keywords (allow it)
        return new ValidationResult(true, null);
    }
    
    /**
     * Check if question is a greeting or meta-question about ALLY
     */
    private boolean isGreetingOrMeta(String questionLower) {
        // Simple greetings (up to 30 chars)
        if (questionLower.length() <= 30) {
            String[] greetings = {"hi", "hello", "hey", "sup", "good morning", 
                                  "good afternoon", "good evening", "how are you"};
            for (String greeting : greetings) {
                if (questionLower.matches("^" + greeting + "\\s*[.!?]*$")) {
                    return true;
                }
            }
        }
        
        // Meta questions about ALLY
        for (Pattern pattern : ALLY_META_PATTERNS) {
            if (pattern.matcher(questionLower).find()) {
                return true;
            }
        }
        
        return false;
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
    }
}