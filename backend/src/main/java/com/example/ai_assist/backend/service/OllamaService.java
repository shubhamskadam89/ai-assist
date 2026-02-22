package com.example.ai_assist.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@Service
public class OllamaService {

        @Value("${ai.ollama.url:http://localhost:11434/api/generate}")
        private String url;

        @Value("${ai.ollama.model:qwen3-coder:480b-cloud}")
        private String model;

        private final RestTemplate restTemplate = new RestTemplate();

        public String generateHint(String problem, String code) {

                String prompt = """
                                You are a friendly, encouraging coding mentor speaking in conversational Hinglish (Hindi + English).

                                Your job is to GUIDE the student, NOT solve the problem for them. Observe their code.

                                RULES (STRICTLY FOLLOW THESE FORMATS):
                                1. If their approach is correct:
                                   - Your response MUST start exactly with "CORRECT: "
                                   - Followed by a short encouraging message like "Badiya jaa rahe ho, keep going!" or "Sahi direction mein ho, complete it!".
                                2. If they are making a mistake, stuck, or using an inefficient approach:
                                   - Your response MUST start exactly with "HINT: "
                                   - Followed by exactly ONE short guiding hint.
                                   - MAXIMUM length: 2 to 3 short lines.
                                   - NO direct code solutions. NO writing the algorithm for them.
                                   - Just point out the flaw gently and ask them to think about a specific alternative, in a friendly Hinglish tone.

                                Do not include any other text except the CORRECT: or HINT: prefix and your message.

                                Problem:
                                """
                                + problem + """

                                                Code:
                                                """ + code;

                Map<String, Object> requestBody = Map.of(
                                "model", model,
                                "prompt", prompt,
                                "stream", false);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                try {
                        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                        return (String) response.getBody().get("response");
                } catch (Exception e) {
                        e.printStackTrace();
                        return "Error communicating with AI: " + e.getMessage();
                }
        }
}
