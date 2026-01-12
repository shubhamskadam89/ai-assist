package com.example.ai_assist.backend.domain;

import com.example.ai_assist.backend.domain.enums.ApproachType;

public class DetectionResult {

    private final ApproachType approach;
    private final double confidence;

    public DetectionResult(ApproachType approach, double confidence) {
        this.approach = approach;
        this.confidence = confidence;
    }

    public ApproachType getApproach() {
        return approach;
    }

    public double getConfidence() {
        return confidence;
    }
}
