package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.ai.model.CodeAnalysisResult;
import com.example.ai_assist.backend.domain.SignalVector;
import com.example.ai_assist.backend.domain.enums.ApproachType;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class PythonAiCodeAnalyzer implements AiCodeAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(PythonAiCodeAnalyzer.class);

    private final RestTemplate restTemplate;
    private static final String AI_SERVICE_BASE_URL = "http://localhost:8000";

    public PythonAiCodeAnalyzer() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    @Async
    public Future<CodeAnalysisResult> analyze(String language, String rawCode, SignalVector signalVectorFallback,
            String expectedOptimal, int mistakeCount) {
        log.info("Calling Python AI service (legacy): language={}, expectedOptimal={}, mistakeCount={}",
                language, expectedOptimal, mistakeCount);
        try {
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("language", language);
            requestBody.put("rawCode", rawCode);
            requestBody.put("expectedOptimal", expectedOptimal);
            requestBody.put("mistakeCount", mistakeCount);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Send request
            ResponseEntity<AiServiceResponse> response = restTemplate.postForEntity(AI_SERVICE_BASE_URL + "/analyze",
                    entity,
                    AiServiceResponse.class);

            AiServiceResponse body = response.getBody();
            if (body == null) {
                return new AsyncResult<>(new CodeAnalysisResult(ApproachType.UNKNOWN, 0.0, null));
            }

            log.info("Python AI service response: approach={}, confidence={}",
                    body.detectedApproach, body.confidence);

            ApproachType approach = mapApproach(body.detectedApproach);

            return new AsyncResult<>(new CodeAnalysisResult(
                    approach,
                    body.confidence,
                    body.conceptualHint));

        } catch (Exception e) {
            log.error("Error communicating with Python AI service", e);
            // Fallback to minimal result
            return new AsyncResult<>(new CodeAnalysisResult(ApproachType.UNKNOWN, 0.0, null));
        }
    }

    @Override
    @Async
    public Future<String> detectApproach(String language, String rawCode) {
        log.info("Calling Python AI service (/detect-approach): language={}", language);
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("language", language);
            requestBody.put("rawCode", rawCode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVICE_BASE_URL + "/detect-approach", entity,
                    Map.class);

            Map body = response.getBody();
            if (body != null && body.containsKey("detectedApproach")) {
                return new AsyncResult<>((String) body.get("detectedApproach"));
            }
            return new AsyncResult<>("UNKNOWN");
        } catch (Exception e) {
            log.error("Error in detectApproach", e);
            return new AsyncResult<>("UNKNOWN");
        }
    }

    @Override
    @Async
    public Future<String> generateHint(String expectedOptimal, String detectedApproach, int mistakeCount) {
        log.info("Calling Python AI service (/generate-hint): expected={}, detected={}, mistakes={}",
                expectedOptimal, detectedApproach, mistakeCount);
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("expectedOptimal", expectedOptimal);
            requestBody.put("detectedApproach", detectedApproach);
            requestBody.put("mistakeCount", mistakeCount);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVICE_BASE_URL + "/generate-hint", entity,
                    Map.class);

            Map body = response.getBody();
            if (body != null && body.containsKey("conceptualHint")) {
                return new AsyncResult<>((String) body.get("conceptualHint"));
            }
            return new AsyncResult<>(null);
        } catch (Exception e) {
            log.error("Error in generateHint", e);
            return new AsyncResult<>(null);
        }
    }

    private ApproachType mapApproach(String approachString) {
        if (approachString == null)
            return ApproachType.UNKNOWN;
        String upper = approachString.toUpperCase();

        // Simple heuristic mapping
        if (upper.contains("BRUTE"))
            return ApproachType.BRUTE_FORCE;
        if (upper.contains("HASH") || upper.contains("MAP"))
            return ApproachType.HASHMAP;
        if (upper.contains("POINTER"))
            return ApproachType.TWO_POINTER;
        if (upper.contains("DFS") || upper.contains("DEPTH"))
            return ApproachType.DFS;
        if (upper.contains("GREEDY"))
            return ApproachType.GREEDY;
        if (upper.contains("DYNAMIC") || upper.contains("DP"))
            return ApproachType.DP;

        return ApproachType.UNKNOWN;
    }

    // Response DTO
    // Must be static for Jackson
    public static class AiServiceResponse {
        public String detectedApproach;
        public String alignment;
        public String conceptualHint;
        public double confidence;
    }
}
