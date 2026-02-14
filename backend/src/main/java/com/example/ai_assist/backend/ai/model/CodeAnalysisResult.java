package com.example.ai_assist.backend.ai.model;

import com.example.ai_assist.backend.domain.enums.ApproachType;

public class CodeAnalysisResult {

    private final ApproachType detectedApproach;
    private final double confidence;

    public CodeAnalysisResult(
            ApproachType detectedApproach,
            double confidence) {
        this.detectedApproach = detectedApproach;
        this.confidence = confidence;
    }

    public ApproachType getDetectedApproach() {
        return detectedApproach;
    }

    public double getConfidence() {
        return confidence;
    }
}
