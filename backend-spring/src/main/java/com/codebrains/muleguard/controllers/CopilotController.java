package com.codebrains.muleguard.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * The frontend's SAR narrative drafting button (SarReportView.jsx) calls
 * a relative "/api/copilot" endpoint. The Vite dev proxy (vite.config.ts)
 * forwards that to this Spring Boot backend, which in turn forwards it to
 * the ai-engine-python microservice that actually talks to Gemini. This
 * keeps the Gemini API key isolated to one Python process and off the
 * frontend entirely.
 */
@RestController
public class CopilotController {

    private final RestTemplate restTemplate;

    @Value("${muleguard.ai-engine.url}")
    private String aiEngineUrl;

    public CopilotController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping(value = "/api/copilot", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> copilot(@RequestBody Map<String, String> body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiEngineUrl + "/api/copilot",
                    request,
                    Map.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                    Map.of("error", "AI engine unreachable: " + e.getMessage())
            );
        }
    }
}
