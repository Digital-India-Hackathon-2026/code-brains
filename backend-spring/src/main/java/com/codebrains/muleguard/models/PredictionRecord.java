package com.codebrains.muleguard.models;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

/**
 * Every ML prediction that flows through this backend gets persisted here,
 * so the frontend's history/dashboard views have something durable to read
 * from Postgres instead of only in-memory mock data.
 */
@Entity
@Table(name = "prediction_records")
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionId;
    private String sourceAccount;
    private String destAccount;
    private double amount;

    private double fraudProbability;
    private double compositeRiskScore;
    private String riskLevel;
    private boolean predictedFraud;

    @ElementCollection
    @CollectionTable(name = "prediction_flagged_reasons", joinColumns = @JoinColumn(name = "prediction_id"))
    @Column(name = "reason", length = 1000)
    private List<String> flaggedReasons;

    private String modelName;

    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getSourceAccount() { return sourceAccount; }
    public void setSourceAccount(String sourceAccount) { this.sourceAccount = sourceAccount; }

    public String getDestAccount() { return destAccount; }
    public void setDestAccount(String destAccount) { this.destAccount = destAccount; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(double fraudProbability) { this.fraudProbability = fraudProbability; }

    public double getCompositeRiskScore() { return compositeRiskScore; }
    public void setCompositeRiskScore(double compositeRiskScore) { this.compositeRiskScore = compositeRiskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public boolean isPredictedFraud() { return predictedFraud; }
    public void setPredictedFraud(boolean predictedFraud) { this.predictedFraud = predictedFraud; }

    public List<String> getFlaggedReasons() { return flaggedReasons; }
    public void setFlaggedReasons(List<String> flaggedReasons) { this.flaggedReasons = flaggedReasons; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
