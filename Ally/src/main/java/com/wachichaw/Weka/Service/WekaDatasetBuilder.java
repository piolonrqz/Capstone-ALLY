package com.wachichaw.Weka.Service;

import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Repo.LegalCaseRepo;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import java.util.Arrays;
import java.util.Collections;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;
import java.util.Random;

@Component
public class WekaDatasetBuilder {
    
    @Autowired
    private LawyerRepo lawyerRepo;
    
    @Autowired
    private LegalCaseRepo casesRepo;
    
    public Instances buildTrainingDataset() throws Exception {
        // Define attributes with proper ordering
        ArrayList<Attribute> attributes = new ArrayList<>();
        
        // Case attributes
        List<String> caseTypes = Arrays.asList("CRIMINAL", "CIVIL", "FAMILY", "CORPORATE", "LABOR", "REAL_ESTATE");
        attributes.add(new Attribute("case_type", caseTypes));
        
        List<String> urgencyLevels = Arrays.asList("LOW", "MEDIUM", "HIGH");
        attributes.add(new Attribute("urgency", urgencyLevels));
        
        // Lawyer attributes
        attributes.add(new Attribute("experience_years")); // Numeric
        attributes.add(new Attribute("cases_handled"));    // Numeric
        
        // Specialization attributes (binary for each specialization)
        for (String caseType : caseTypes) {
            List<String> hasSpec = Arrays.asList("YES", "NO");
            attributes.add(new Attribute("has_" + caseType.toLowerCase(), hasSpec));
        }
        
        // Additional features
        attributes.add(new Attribute("lawyer_efficiency")); // Cases per year
        attributes.add(new Attribute("specialization_count")); // Number of specializations
        
        // Target attribute (suitability score)
        List<String> suitabilityScores = Arrays.asList("POOR", "FAIR", "GOOD", "EXCELLENT");
        attributes.add(new Attribute("suitability", suitabilityScores));
        
        // Create dataset
        Instances dataset = new Instances("LawyerRecommendation", attributes, 0);
        dataset.setClassIndex(dataset.numAttributes() - 1);
        
        // Generate training data
        generateTrainingData(dataset);
        
        return dataset;
    }
    
    private void generateTrainingData(Instances dataset) {
        // Get all completed cases with assigned lawyers
        List<LegalCasesEntity> completedCases = casesRepo.findCompletedCasesWithLawyers();
        
        for (LegalCasesEntity case_ : completedCases) {
            LawyerEntity assignedLawyer = case_.getLawyer();
            if (assignedLawyer != null) {
                Instance instance = createInstanceFromCase(case_, assignedLawyer, dataset);
                if (instance != null) {
                    dataset.add(instance);
                }
            }
        }
        
        // !!!! Temporary for NOW || 06-29-2025 !!!!
        // Generate synthetic data if insufficient historical data
        if (dataset.numInstances() < 100) {
            generateSyntheticTrainingData(dataset, 300);
        }
    }
    
    private Instance createInstanceFromCase(LegalCasesEntity case_, LawyerEntity lawyer, Instances dataset) {
        try {
            Instance instance = new DenseInstance(dataset.numAttributes());
            instance.setDataset(dataset);
            
            int attrIndex = 0;
            
            // Case type
            String caseType = normalizeCaseType(case_.getCaseType());
            instance.setValue(attrIndex++, caseType);
            
            // Urgency level
            String urgency = case_.getUrgencyLevel() != null ? 
                case_.getUrgencyLevel().toString().toUpperCase() : "MEDIUM";
            instance.setValue(attrIndex++, urgency);
            
            // Lawyer experience (years)
            int experienceYears = parseExperienceToYears(lawyer.getExperience());
            instance.setValue(attrIndex++, experienceYears);
            
            // Cases handled
            instance.setValue(attrIndex++, lawyer.getCasesHandled());
            
            // Specialization attributes
            List<String> lawyerSpecs = lawyer.getSpecialization();
            List<String> caseTypes = Arrays.asList("CRIMINAL", "CIVIL", "FAMILY", "CORPORATE", "LABOR", "REAL_ESTATE");
            
            for (String spec : caseTypes) {
                boolean hasSpec = lawyerSpecs.contains(spec);
                instance.setValue(attrIndex++, hasSpec ? "YES" : "NO");
            }
            
            // Lawyer efficiency (cases per year)
            double efficiency = calculateLawyerEfficiency(lawyer.getCasesHandled(), experienceYears);
            instance.setValue(attrIndex++, efficiency);
            
            // Specialization count
            instance.setValue(attrIndex++, lawyerSpecs.size());
            
            // Calculate suitability based on case outcome and match factors
            String suitability = calculateSuitability(case_, lawyer);
            instance.setValue(attrIndex, suitability);
            
            return instance;
            
        } catch (Exception e) {
            System.err.println("Error creating instance: " + e.getMessage());
            return null;
        }
    }
    
    private String calculateSuitability(LegalCasesEntity case_, LawyerEntity lawyer) {
        double score = 0.0;
        String caseType = normalizeCaseType(case_.getCaseType());
        
        // 1. Perfect specialization match (40% weight)
        if (lawyer.getSpecialization().contains(caseType)) {
            score += 4.0;
        } else if (hasRelatedSpecialization(lawyer.getSpecialization(), caseType)) {
            score += 2.5;
        }
        
        // 2. Experience level (25% weight)
        int years = parseExperienceToYears(lawyer.getExperience());
        if (years >= 15) score += 2.5;
        else if (years >= 10) score += 2.0;
        else if (years >= 5) score += 1.5;
        else if (years >= 2) score += 1.0;
        else score += 0.5;
        
        // 3. Case handling efficiency (20% weight)
        double efficiency = calculateLawyerEfficiency(lawyer.getCasesHandled(), years);
        if (efficiency >= 8 && efficiency <= 15) score += 2.0;
        else if (efficiency >= 5 && efficiency <= 20) score += 1.5;
        else if (efficiency >= 3) score += 1.0;
        else score += 0.5;
        
        // 4. Urgency matching (10% weight)
        if (case_.getUrgencyLevel() != null) {
            String urgency = case_.getUrgencyLevel().toString().toUpperCase();
            score += getUrgencyMatchScore(urgency, years);
        }
        
        // 5. Specialization diversity bonus (5% weight)
        int specCount = lawyer.getSpecialization().size();
        if (specCount >= 2 && specCount <= 4) score += 0.5;
        
        // Convert to classification (normalized to 10-point scale)
        double normalizedScore = (score / 10.0) * 10.0;
        
        if (normalizedScore >= 8.0) return "EXCELLENT";
        if (normalizedScore >= 6.0) return "GOOD";
        if (normalizedScore >= 4.0) return "FAIR";
        return "POOR";
    }
    
    private void generateSyntheticTrainingData(Instances dataset, int numInstances) {
        Random random = new Random(42); // Fixed seed for reproducibility
        String[] caseTypes = {"CRIMINAL", "CIVIL", "FAMILY", "CORPORATE", "LABOR", "REAL_ESTATE"};
        String[] urgencyLevels = {"LOW", "MEDIUM", "HIGH"};
        
        for (int i = 0; i < numInstances; i++) {
            Instance instance = new DenseInstance(dataset.numAttributes());
            instance.setDataset(dataset);
            
            int attrIndex = 0;
            
            // Random case type
            String caseType = caseTypes[random.nextInt(caseTypes.length)];
            instance.setValue(attrIndex++, caseType);
            
            // Weighted urgency distribution
            String urgency = getRandomUrgency(random);
            instance.setValue(attrIndex++, urgency);
            
            // Realistic experience distribution (1-25 years, bell curve around 8)
            int experience = Math.max(1, Math.min(25, (int)(random.nextGaussian() * 5 + 8)));
            instance.setValue(attrIndex++, experience);
            
            // Cases handled based on experience with variance
            int casesHandled = Math.max(1, (int)(experience * (6 + random.nextGaussian() * 4)));
            instance.setValue(attrIndex++, casesHandled);
            
            // Specialization attributes with realistic distribution
            for (String spec : caseTypes) {
                boolean hasSpec = generateRealisticSpecialization(spec, caseType, random);
                instance.setValue(attrIndex++, hasSpec ? "YES" : "NO");
            }
            
            // Efficiency
            double efficiency = calculateLawyerEfficiency(casesHandled, experience);
            instance.setValue(attrIndex++, efficiency);
            
            // Count specializations
            int specCount = 0;
            for (int j = 4; j < 4 + caseTypes.length; j++) {
                if ("YES".equals(instance.stringValue(j))) specCount++;
            }
            instance.setValue(attrIndex++, specCount);
            
            // Calculate synthetic suitability
            String suitability = calculateSyntheticSuitability(instance, caseType);
            instance.setValue(attrIndex, suitability);
            
            dataset.add(instance);
        }
    }
    
    private boolean generateRealisticSpecialization(String spec, String caseType, Random random) {
        if (spec.equals(caseType)) {
            return random.nextDouble() > 0.1; // 90% chance for matching specialization
        } else if (isRelatedSpecialization(spec, caseType)) {
            return random.nextDouble() > 0.6; // 40% chance for related specialization
        } else {
            return random.nextDouble() > 0.85; // 15% chance for unrelated specialization
        }
    }
    
    private String getRandomUrgency(Random random) {
        double rand = random.nextDouble();
        if (rand < 0.3) return "LOW";
        if (rand < 0.8) return "MEDIUM";
        return "HIGH";
    }
    
    private String calculateSyntheticSuitability(Instance instance, String caseType) {
        double score = 0.0;
        
        // Get values from instance
        int experience = (int) instance.value(2);
        int casesHandled = (int) instance.value(3);
        String urgency = instance.stringValue(1);
        
        // Check specialization match
        int specIndex = 4;
        for (String spec : Arrays.asList("CRIMINAL", "CIVIL", "FAMILY", "CORPORATE", "LABOR", "REAL_ESTATE")) {
            if (spec.equals(caseType) && "YES".equals(instance.stringValue(specIndex))) {
                score += 4.0;
                break;
            } else if ("YES".equals(instance.stringValue(specIndex)) && isRelatedSpecialization(spec, caseType)) {
                score += 2.5;
            }
            specIndex++;
        }
        
        // Experience scoring
        if (experience >= 15) score += 2.5;
        else if (experience >= 10) score += 2.0;
        else if (experience >= 5) score += 1.5;
        else if (experience >= 2) score += 1.0;
        else score += 0.5;
        
        // Efficiency scoring
        double efficiency = calculateLawyerEfficiency(casesHandled, experience);
        if (efficiency >= 8 && efficiency <= 15) score += 2.0;
        else if (efficiency >= 5 && efficiency <= 20) score += 1.5;
        else if (efficiency >= 3) score += 1.0;
        else score += 0.5;
        
        // Urgency matching
        score += getUrgencyMatchScore(urgency, experience);
        
        // Normalize and classify
        double normalizedScore = (score / 10.0) * 10.0;
        
        if (normalizedScore >= 8.0) return "EXCELLENT";
        if (normalizedScore >= 6.0) return "GOOD";
        if (normalizedScore >= 4.0) return "FAIR";
        return "POOR";
    }
    
    // Helper methods
    private String normalizeCaseType(String caseType) {
        if (caseType == null) return "CIVIL";
        return caseType.toUpperCase().replace(" ", "_");
    }
    
    private boolean hasRelatedSpecialization(List<String> lawyerSpecs, String caseType) {
        Map<String, List<String>> relatedSpecs = Map.of(
            "CRIMINAL", Arrays.asList("CIVIL"),
            "CIVIL", Arrays.asList("CRIMINAL", "REAL_ESTATE", "FAMILY"),
            "FAMILY", Arrays.asList("CIVIL"),
            "CORPORATE", Arrays.asList("LABOR", "REAL_ESTATE"),
            "LABOR", Arrays.asList("CORPORATE", "CIVIL"),
            "REAL_ESTATE", Arrays.asList("CORPORATE", "CIVIL")
        );
        
        return relatedSpecs.getOrDefault(caseType, Collections.emptyList())
                .stream()
                .anyMatch(lawyerSpecs::contains);
    }
    
    private boolean isRelatedSpecialization(String lawyerSpec, String caseType) {
        Map<String, List<String>> relatedSpecs = Map.of(
            "CRIMINAL", Arrays.asList("CIVIL"),
            "CIVIL", Arrays.asList("CRIMINAL", "REAL_ESTATE", "FAMILY"),
            "FAMILY", Arrays.asList("CIVIL"),
            "CORPORATE", Arrays.asList("LABOR", "REAL_ESTATE"),
            "LABOR", Arrays.asList("CORPORATE", "CIVIL"),
            "REAL_ESTATE", Arrays.asList("CORPORATE", "CIVIL")
        );
        
        return relatedSpecs.getOrDefault(caseType, Collections.emptyList())
                .contains(lawyerSpec);
    }
    
    private double calculateLawyerEfficiency(int casesHandled, int experienceYears) {
        if (experienceYears == 0) return 0.0;
        return (double) casesHandled / experienceYears;
    }
    
    private double getUrgencyMatchScore(String urgency, int experience) {
        switch (urgency.toUpperCase()) {
            case "HIGH":
                return experience >= 10 ? 1.0 : experience >= 5 ? 0.7 : 0.3;
            case "MEDIUM":
                return experience >= 5 ? 1.0 : experience >= 2 ? 0.8 : 0.5;
            case "LOW":
                return experience >= 1 ? 1.0 : 0.8;
            default:
                return 0.5;
        }
    }
    
    private int parseExperienceToYears(String experienceStr) {
        if (experienceStr == null || experienceStr.trim().isEmpty()) return 0;
        
        try {
            // Extract first number found in string
            String digits = experienceStr.replaceAll("[^0-9]", "");
            if (digits.isEmpty()) return 0;
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}