package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.domain.enums.ApproachType;

public record ClassificationResult(ApproachType approach, double confidence) {
}
