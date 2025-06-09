package com.wachichaw.Case.Service;


import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Repo.LegalCaseRepo;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;
import com.wachichaw.Document.Entity.DocumentEntity;
import com.wachichaw.Document.Repo.DocumentRepo;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;


@Service
public class LegalCaseService {
    

    @Autowired
    private ClientRepo clientRepo;
    @Autowired
    private LawyerRepo lawyerRepo;
    @Autowired
    private final LegalCaseRepo legalCaseRepo;

    public LegalCaseService(LegalCaseRepo legalCaseRepo) {
        this.legalCaseRepo = legalCaseRepo;
    }


    public LegalCasesEntity createLegalCase(int clientId, LawyerEntity lawyer, String title, Long caseNo, String caseDescription, LocalDateTime caseDate, String status) {
        ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
        
        LegalCasesEntity legalCase = new LegalCasesEntity();
        legalCase.setClient(client);
        legalCase.setLawyer(lawyer);
        legalCase.setTitle(title);
        legalCase.setCaseNumber(caseNo);
        legalCase.setDescription(caseDescription);
        legalCase.setDateSubmitted(caseDate);
        legalCase.setStatus(status);

        return legalCaseRepo.save(legalCase);
    }
}
