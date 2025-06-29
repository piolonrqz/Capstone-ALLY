package com.wachichaw.AI.Service;

import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.wachichaw.AI.Controller.LawyerRecommendationController.ModelInfo;
import com.wachichaw.AI.Entity.LawyerRecommendationRequest;
import com.wachichaw.AI.Entity.LawyerRecommendationResponse;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;

import java.util.Arrays;
import jakarta.annotation.PostConstruct;
import weka.classifiers.trees.J48;
import weka.classifiers.Evaluation;
import weka.core.Instances;
import weka.core.DenseInstance;
import weka.core.Instance;

@Service
public class LawyerRecommendationService {
    
    @Autowired
    private WekaDatasetBuilder datasetBuilder;
    
    @Autowired
    private LawyerRepo lawyerRepository;
    
    private J48 decisionTree;
    private Instances trainingDataset;
    private LocalDateTime lastTrainingTime;
    private double modelAccuracy;
    
    @PostConstruct
    public void initializeModel() {
        try {
            trainModel();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public void trainModel() throws Exception {
        System.out.println("Starting model training...");
        
        // Build training dataset
        trainingDataset = datasetBuilder.buildTrainingDataset();
        
        if (trainingDataset.numInstances() == 0) {
            throw new RuntimeException("No training data available. Please ensure there are completed cases with lawyer assignments.");
        }
        
        // Initialize and train decision tree
        decisionTree = new J48();
        decisionTree.setConfidenceFactor(0.25f);
        decisionTree.setMinNumObj(2);
        decisionTree.setUnpruned(false);
        decisionTree.buildClassifier(trainingDataset);
        
        // Evaluate model accuracy
        evaluateModel();
        
        lastTrainingTime = LocalDateTime.now();
        
        System.out.println("Decision Tree Model Trained Successfully!");
        System.out.println("Training instances: " + trainingDataset.numInstances());
        System.out.println("Model accuracy: " + String.format("%.2f%%", modelAccuracy * 100));
        System.out.println(decisionTree.toString());
    }
    
    private void evaluateModel() throws Exception {
        Evaluation eval = new Evaluation(trainingDataset);
        eval.crossValidateModel(decisionTree, trainingDataset, 10, new java.util.Random(1));
        modelAccuracy = eval.pctCorrect() / 100.0;
    }
    
    public List<LawyerRecommendationResponse> recommendLawyers(LawyerRecommendationRequest request) {
        try {
            if (decisionTree == null) {
                throw new RuntimeException("Model not trained. Please train the model first.");
            }
            
            List<LawyerEntity> allLawyers = lawyerRepository.findAll();
            List<LawyerRecommendationResponse> recommendations = new ArrayList<>();
            
            for (LawyerEntity lawyer : allLawyers) {
                // Skip lawyers that are not verified
                if (!lawyer.getCredentialsVerified()) {
                    continue;
                }
                
                double matchScore = calculateMatchScore(request, lawyer);
                String matchReason = generateMatchReason(request, lawyer, matchScore);
                
                recommendations.add(new LawyerRecommendationResponse(
                    lawyer, matchScore, matchReason, 0
                ));
            }
            
            // Sort by match score (descending)
            recommendations.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
            
            // Set ranks
            for (int i = 0; i < recommendations.size(); i++) {
                recommendations.get(i).setRank(i + 1);
            }
            
            // Return top 10 recommendations
            return recommendations.stream().limit(10).collect(Collectors.toList());
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private double calculateMatchScore(LawyerRecommendationRequest request, LawyerEntity lawyer) throws Exception {
        // Create instance for prediction
        Instance instance = new DenseInstance(trainingDataset.numAttributes());
        instance.setDataset(trainingDataset);
        
        // Set case attributes
        instance.setValue(0, request.getCaseType() != null ? request.getCaseType() : "Civil");
        instance.setValue(1, request.getUrgencyLevel() != null ? request.getUrgencyLevel() : "Medium");
        
        // Set lawyer attributes
        int years = parseExperienceToYears(lawyer.getExperience());
        instance.setValue(2, years);
        instance.setValue(3, lawyer.getCasesHandled() != 0 ? lawyer.getCasesHandled() : 10);
        
        // Set specialization attributes
        List<String> lawyerSpecs = lawyer.getSpecialization();
        int specIndex = 4;
        for (String spec : Arrays.asList("Criminal", "Civil", "Family", "Corporate", "Labor", "Real Estate")) {
            instance.setValue(specIndex++, lawyerSpecs.contains(spec) ? "Yes" : "No");
        }
        
        // Get prediction distribution
        double[] distribution = decisionTree.distributionForInstance(instance);
        
        // Calculate weighted score based on prediction confidence
        double score = 0.0;
        String[] suitabilityLevels = {"Poor", "Fair", "Good", "Excellent"};
        double[] weights = {1.0, 2.0, 3.0, 4.0};
        
        for (int i = 0; i < distribution.length; i++) {
            score += distribution[i] * weights[i];
        }
        
        // Apply additional business logic scoring
        score = applyBusinessLogicScoring(score, request, lawyer);
        
        // Normalize to 0-100 scale
        return Math.min(100.0, (score / 4.0) * 100.0);
    }
    
    private double applyBusinessLogicScoring(double baseScore, LawyerRecommendationRequest request, LawyerEntity lawyer) {
        double adjustedScore = baseScore;
        
        // Boost score for exact specialization match
        if (lawyer.getSpecialization().contains(request.getCaseType())) {
            adjustedScore += 0.5;
        }
        
        // Consider experience for high urgency cases
        if ("High".equals(request.getUrgencyLevel())) {
            int years = parseExperienceToYears(lawyer.getExperience());
            if (years >= 10) {
                adjustedScore += 0.3;
            } else if (years < 3) {
                adjustedScore -= 0.2;
            }
        }
        
        // Consider case load efficiency
        int years = parseExperienceToYears(lawyer.getExperience());
        if (years > 0) {
            double casesPerYear = (double) lawyer.getCasesHandled() / years;
            if (casesPerYear >= 8 && casesPerYear <= 15) {
                adjustedScore += 0.2;
            } else if (casesPerYear > 20) {
                adjustedScore -= 0.1; // May be overloaded
            }
        }
        
        return Math.max(0.0, adjustedScore);
    }
    
    private String generateMatchReason(LawyerRecommendationRequest request, LawyerEntity lawyer, double matchScore) {
        StringBuilder reason = new StringBuilder();
        
        // Check specialization match
        if (lawyer.getSpecialization().contains(request.getCaseType())) {
            reason.append("Specializes in ").append(request.getCaseType()).append(" law. ");
        }
        
        // Check experience
        int years = parseExperienceToYears(lawyer.getExperience());
        if (years > 15) {
            reason.append("Highly experienced (").append(years).append(" years). ");
        } else if (years > 8) {
            reason.append("Experienced (").append(years).append(" years). ");
        } else if (years > 3) {
            reason.append("Moderately experienced (").append(years).append(" years). ");
        }
        
        // Check case handling capacity
        if (lawyer.getCasesHandled() > 50) {
            reason.append("Extensive case handling experience (").append(lawyer.getCasesHandled()).append(" cases). ");
        }
        
        // Match score interpretation
        if (matchScore >= 90) {
            reason.append("Excellent match for your case requirements.");
        } else if (matchScore >= 75) {
            reason.append("Very good match for your case requirements.");
        } else if (matchScore >= 60) {
            reason.append("Good match for your case requirements.");
        } else {
            reason.append("Moderate match - may handle your case type.");
        }
        
        if (reason.length() == 0) {
            reason.append("General practice lawyer with relevant experience.");
        }
        
        return reason.toString().trim();
    }
    
    public boolean isModelReady() {
        return decisionTree != null && trainingDataset != null;
    }
    
    public ModelInfo getModelInfo() {
        if (!isModelReady()) {
            return new ModelInfo("Decision Tree (J48)", 0, "Never", 0.0);
        }
        
        String lastTrained = lastTrainingTime != null ? 
            lastTrainingTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : 
            "Unknown";
        
        return new ModelInfo(
            "Decision Tree (J48)", 
            trainingDataset.numInstances(), 
            lastTrained, 
            modelAccuracy
        );
    }
    
    // Parse experience string to extract years
    // Example: "10 years" → 10
    private int parseExperienceToYears(String experienceStr) {
        if (experienceStr == null) return 0;

        try {
            // Extract digits from the string (e.g., "10 years" → 10)
            String digits = experienceStr.replaceAll("[^0-9]", "");
            if (digits.isEmpty()) return 0;
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}