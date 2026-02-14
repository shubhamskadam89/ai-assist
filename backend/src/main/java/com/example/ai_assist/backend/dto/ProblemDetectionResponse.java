package com.example.ai_assist.backend.dto;

import com.example.ai_assist.backend.domain.enums.ApproachType;
import java.util.UUID;

public record ProblemDetectionResponse(
        UUID problemContextId,
        ApproachType expectedOptimal,
        double confidence) {
}
