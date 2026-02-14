package com.example.ai_assist.backend.dto;

import com.example.ai_assist.backend.domain.SignalVector;
import java.util.UUID;

public record CodeAnalysisRequest(
        String sessionId,
        UUID problemContextId,
        String language,
        String rawCode,
        SignalVector signalVector) {
}
