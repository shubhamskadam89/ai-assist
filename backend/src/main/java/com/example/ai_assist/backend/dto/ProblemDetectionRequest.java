package com.example.ai_assist.backend.dto;

public record ProblemDetectionRequest(
        String title,
        String description,
        String platform,
        String url) {
}
