package com.example.ai_assist.backend.dto;

public record CodeAnalysisResponse(
        boolean showHint,
        String level,
        String message) {
}
