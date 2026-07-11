package com.codebrains.muleguard.models;

import java.util.List;

/**
 * Mirrors the JSON returned by the Python ml-service's /predict endpoint,
 * and (after the fallbackOutput shape used in the frontend) what the
 * React app expects back: compositeRiskScore, riskLevel, flaggedReasons, timestamp.
 */
public class PredictionResponse {

    private String transactionId;
    private double fraudProbability;
    private double compositeRiskScore;
    private String riskLevel;
    private boolean predictedFraud;
    private List<String> flaggedReasons;
    private String model;
    private String timestamp;

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

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

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
