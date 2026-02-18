package com.example.ai_assist.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.Map;

@Service
public class OllamaService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateHint(String problem, String code) {

        String url = "http://localhost:11434/api/generate";

        String prompt = """
                You are a coding interview assistant.
                Give ONLY a short hint (1-2 sentences).
                Do NOT give solution.

                Problem:
                """ + problem + """

                Code:
                """ + code;

        Map<String, Object> requestBody = Map.of(
                "model", "phi3",
                "prompt", prompt,
                "stream", false
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, entity, Map.class);

        return (String) response.getBody().get("response");
    }
}
