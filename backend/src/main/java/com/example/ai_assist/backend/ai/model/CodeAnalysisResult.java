package com.example.ai_assist.backend.ai.model;

import com.example.ai_assist.backend.domain.enums.ApproachType;

public class CodeAnalysisResult {

    private final ApproachType detectedApproach;
    private final double confidence;
    private final String conceptualHint;

    public CodeAnalysisResult(
            ApproachType detectedApproach,
            double confidence) {
        this(detectedApproach, confidence, null);
    }

    public CodeAnalysisResult(
            ApproachType detectedApproach,
            double confidence,
            String conceptualHint) {
        this.detectedApproach = detectedApproach;
        this.confidence = confidence;
        this.conceptualHint = conceptualHint;
    }

    public ApproachType getDetectedApproach() {
        return detectedApproach;
    }

    public double getConfidence() {
        return confidence;
    }

    public String getConceptualHint() {
        return conceptualHint;
    }
}
