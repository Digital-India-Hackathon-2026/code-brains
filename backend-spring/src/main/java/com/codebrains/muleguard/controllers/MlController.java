package com.codebrains.muleguard.controllers;

import com.codebrains.muleguard.models.PredictionRecord;
import com.codebrains.muleguard.models.PredictionResponse;
import com.codebrains.muleguard.models.TransactionRequest;
import com.codebrains.muleguard.repositories.PredictionRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * This is the endpoint the frontend already calls:
 *   POST http://localhost:8080/api/v1/ml/predict
 * (see muletrace-ai/src/components/SecureInterfacesPage.jsx & SandboxView.jsx)
 *
 * It forwards the request to the Python ml-service (your trained XGBoost
 * model), stores each result in Postgres, and returns the predictions
 * back to the frontend.
 */
@RestController
@RequestMapping("/api/v1/ml")
public class MlController {

    private final RestTemplate restTemplate;
    private final PredictionRecordRepository repository;

    @Value("${muleguard.ml-service.url}")
    private String mlServiceUrl;

    public MlController(RestTemplate restTemplate, PredictionRecordRepository repository) {
        this.restTemplate = restTemplate;
        this.repository = repository;
    }

    @PostMapping(value = "/predict", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> predict(@RequestBody List<TransactionRequest> transactions) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<TransactionRequest>> request = new HttpEntity<>(transactions, headers);

            ResponseEntity<PredictionResponse[]> response = restTemplate.postForEntity(
                    mlServiceUrl + "/predict",
                    request,
                    PredictionResponse[].class
            );

            PredictionResponse[] predictions = response.getBody();
            if (predictions != null) {
                for (int i = 0; i < predictions.length && i < transactions.size(); i++) {
                    persist(transactions.get(i), predictions[i]);
                }
            }

            return ResponseEntity.ok(predictions);

        } catch (Exception e) {
            // Mirrors the frontend's own fallback contract so the UI never breaks
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                    java.util.Map.of(
                            "error", "Inference service unreachable",
                            "fallbackReason", "ml-service did not respond: " + e.getMessage()
                    )
            );
        }
    }

    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<PredictionRecord> history() {
        return repository.findTop50ByOrderByCreatedAtDesc();
    }

    private void persist(TransactionRequest tx, PredictionResponse pred) {
        PredictionRecord record = new PredictionRecord();
        record.setTransactionId(pred.getTransactionId());
        record.setSourceAccount(tx.getSourceAccount());
        record.setDestAccount(tx.getDestAccount());
        record.setAmount(tx.getAmount());
        record.setFraudProbability(pred.getFraudProbability());
        record.setCompositeRiskScore(pred.getCompositeRiskScore());
        record.setRiskLevel(pred.getRiskLevel());
        record.setPredictedFraud(pred.isPredictedFraud());
        record.setFlaggedReasons(pred.getFlaggedReasons());
        record.setModelName(pred.getModel());
        repository.save(record);
    }
}
