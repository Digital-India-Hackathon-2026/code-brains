package com.codebrains.muleguard.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "case_reports")
public class CaseReport {

    @Id
    private String investigationId;
    
    private String transactionId;
    private String accountId;
    private String status;
    private Double mlRiskScore;
    private String riskLevel;
    
    @Column(columnDefinition = "TEXT")
    private String aiExplanation;
    
    private Double confidence;
    private String recommendedAction;
    private LocalDateTime createdAt;

    @ElementCollection
    private List<String> evidence;
    
    @ElementCollection
    private List<String> connectedAccounts;

    // Standard Getters and Setters
    public String getInvestigationId() { return investigationId; }
    public void setInvestigationId(String investigationId) { this.investigationId = investigationId; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getMlRiskScore() { return mlRiskScore; }
    public void setMlRiskScore(Double mlRiskScore) { this.mlRiskScore = mlRiskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getAiExplanation() { return aiExplanation; }
    public void setAiExplanation(String aiExplanation) { this.aiExplanation = aiExplanation; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getEvidence() { return evidence; }
    public void setEvidence(List<String> evidence) { this.evidence = evidence; }

    public List<String> getConnectedAccounts() { return connectedAccounts; }
    public void setConnectedAccounts(List<String> connectedAccounts) { this.connectedAccounts = connectedAccounts; }
}