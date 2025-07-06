package com.wachichaw.Lawyer.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;

import com.wachichaw.Lawyer.Entity.LawyerEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
@Service
public class LawyerService {

    @Autowired
    private LawyerRepo lawyerRepo;

    public List<LawyerEntity> getFilteredLawyers() {
        List<LawyerEntity> allLawyers = lawyerRepo.findAll();
        return allLawyers.stream()
            .filter(lawyer -> parseExperienceToYears(lawyer.getExperience()) >= 10)
            .collect(Collectors.toList());
    }

    public ResponseEntity<LawyerEntity> updateCasesHandled(int lawyerId) {
        LawyerEntity lawyer = lawyerRepo.findById(lawyerId)
            .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));
        
        int currentCasesHandled = lawyer.getCasesHandled();
        int newCasesHandled = currentCasesHandled + 1;

        lawyer.setCasesHandled(newCasesHandled);
        LawyerEntity updatedLawyer = lawyerRepo.save(lawyer);
        
        return ResponseEntity.ok(updatedLawyer);
    }

    private int parseExperienceToYears(String experience) {
        // Implement parsing logic here
        // Example: return Integer.parseInt(experience);
        return 0;
    }
}
