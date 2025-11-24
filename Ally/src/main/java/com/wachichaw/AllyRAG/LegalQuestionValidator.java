package com.wachichaw.AllyRAG;

import org.springframework.stereotype.Component;

@Component
public class LegalQuestionValidator {
    
    /**
     * Backup if Gemini is unreachable
     * Real validation is done by Gemini in Python backend
     */
    public ValidationResult validate(String question) {
        if (question == null || question.trim().isEmpty()) {
            return new ValidationResult(false, "Question cannot be empty");
        }
        
        if (question.length() > 2000) {
            return new ValidationResult(false, 
                "Your message is too long. Please keep it under 2000 characters.");
        }
        
        // Pass everything else - let Gemini handle it
        return new ValidationResult(true, null);
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