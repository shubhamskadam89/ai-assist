package com.example.ai_assist.backend.ai.model;

import com.example.ai_assist.backend.domain.enums.ApproachType;

public class ProblemClassificationResult {

    private final ApproachType expectedOptimal;
    private final double confidence;
    private final String reasoning;

    public ProblemClassificationResult(
            ApproachType expectedOptimal,
            double confidence,
            String reasoning) {
        this.expectedOptimal = expectedOptimal;
        this.confidence = confidence;
        this.reasoning = reasoning;
    }

    public ApproachType getExpectedOptimal() {
        return expectedOptimal;
    }

    public double getConfidence() {
        return confidence;
    }

    public String getReasoning() {
        return reasoning;
    }
}
