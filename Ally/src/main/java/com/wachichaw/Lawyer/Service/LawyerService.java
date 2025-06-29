package com.wachichaw.Lawyer.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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

    private int parseExperienceToYears(String experience) {
        // Implement parsing logic here
        // Example: return Integer.parseInt(experience);
        return 0;
    }
}
