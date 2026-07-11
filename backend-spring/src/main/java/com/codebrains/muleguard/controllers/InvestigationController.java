package com.codebrains.muleguard.controllers;

import com.codebrains.muleguard.models.CaseReport;
import com.codebrains.muleguard.repositories.CaseReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "*"}) // Allows the React frontend to call this
public class InvestigationController {

    @Autowired
    private CaseReportRepository caseReportRepository;

    @PostMapping("/investigations")
    public ResponseEntity<?> startInvestigation(@RequestBody Map<String, Object> evidencePackage) {
        try {
            // 1. Send the evidence to the Python FastAPI Microservice (Running on 8000)
            String pythonApiUrl = "http://localhost:8000/api/investigations";
            RestTemplate restTemplate = new RestTemplate();
            
            // We expect the Python service to return JSON that perfectly matches our CaseReport model
            CaseReport aiReport = restTemplate.postForObject(pythonApiUrl, evidencePackage, CaseReport.class);

            if (aiReport != null) {
                // 2. Save the AI's completed investigation report to PostgreSQL
                caseReportRepository.save(aiReport);
                
                // 3. Return the saved report back to the React frontend
                return ResponseEntity.ok(aiReport);
            } else {
                return ResponseEntity.status(500).body("AI Service returned an empty report.");
            }

        } catch (Exception e) {
            // Mandatory Fallback: If the Python service crashes or times out, Java catches it gracefully
            return ResponseEntity.status(503).body("AI Investigation failed. Fallback triggered: " + e.getMessage());
        }
    }

    // Standard endpoint to retrieve all past investigations for the frontend dashboard
    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(caseReportRepository.findAll());
    }
}
