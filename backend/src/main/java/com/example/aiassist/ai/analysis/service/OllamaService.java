package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@Service
public class OllamaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.ollama.url:http://localhost:11434/api/generate}")
    private String url;

    @Value("${ai.ollama.model:qwen3-coder:480b-cloud}")
    private String model;

    public String generateHint(String problem, String code) {

        if (problem == null || problem.isBlank()) {
            throw new BadRequestException("Problem description cannot be empty");
        }

        if (code == null || code.isBlank()) {
            throw new BadRequestException("Code cannot be empty");
        }

        String prompt = buildPrompt(problem, code);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() == null ||
                !response.getBody().containsKey("response")) {
                throw new BadRequestException("Invalid AI response format");
            }

            Object result = response.getBody().get("response");

            if (result == null) {
                throw new BadRequestException("AI returned empty response");
            }

            return result.toString();

        } catch (Exception e) {
            throw new BadRequestException("Failed to communicate with AI service");
        }
    }

    private String buildPrompt(String problem, String code) {
        return """
                You are a friendly coding mentor.

                RULES:
                If correct: start with "CORRECT: "
                If mistake: start with "HINT: "

                Problem:
                """ + problem + """

                Code:
                """ + code;
    }
}