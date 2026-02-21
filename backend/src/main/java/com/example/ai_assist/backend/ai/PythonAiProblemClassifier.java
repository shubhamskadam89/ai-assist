package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.ai.model.ProblemClassificationResult;
import com.example.ai_assist.backend.domain.enums.ApproachType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class PythonAiProblemClassifier implements AiProblemClassifier {

    private static final Logger log = LoggerFactory.getLogger(PythonAiProblemClassifier.class);

    private final RestTemplate restTemplate;
    private static final String AI_SERVICE_BASE_URL = "http://localhost:8000";

    public PythonAiProblemClassifier() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    @Async
    public Future<ProblemClassificationResult> classify(String title, String description) {
        log.info("Calling Python AI service (/classify): title={}", title);
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("title", title);
            requestBody.put("description", description);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    AI_SERVICE_BASE_URL + "/classify",
                    org.springframework.http.HttpMethod.POST,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> body = response.getBody();
            if (body != null) {
                String optimalStr = (String) body.get("expectedOptimal");
                Object confidenceObj = body.get("confidence");
                Double confidence = 0.0;
                if (confidenceObj instanceof Number) {
                    confidence = ((Number) confidenceObj).doubleValue();
                }

                ApproachType optimal = mapApproach(optimalStr);

                return java.util.concurrent.CompletableFuture.completedFuture(
                        new ProblemClassificationResult(optimal, confidence, "Analyzed by local Ollama"));
            }
            return java.util.concurrent.CompletableFuture.completedFuture(
                    new ProblemClassificationResult(null, 0.0, "Empty response from AI service"));
        } catch (Exception e) {
            log.error("Error in PythonAiProblemClassifier", e);
            return java.util.concurrent.CompletableFuture.completedFuture(
                    new ProblemClassificationResult(null, 0.0, "Error: " + e.getMessage()));
        }
    }

    private ApproachType mapApproach(String approachString) {
        if (approachString == null)
            return ApproachType.UNKNOWN;
        try {
            return ApproachType.valueOf(approachString.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Heuristic fallback
            String upper = approachString.toUpperCase();
            if (upper.contains("BRUTE"))
                return ApproachType.BRUTE_FORCE;
            if (upper.contains("HASH") || upper.contains("MAP"))
                return ApproachType.HASHMAP;
            if (upper.contains("POINTER"))
                return ApproachType.TWO_POINTER;
            if (upper.contains("DFS"))
                return ApproachType.DFS;
            if (upper.contains("GREEDY"))
                return ApproachType.GREEDY;
            if (upper.contains("DP") || upper.contains("DYNAMIC"))
                return ApproachType.DP;
            return ApproachType.UNKNOWN;
        }
    }
}
