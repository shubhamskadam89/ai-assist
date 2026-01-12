package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.domain.Approach;
import com.example.ai_assist.backend.domain.DetectionResult;
import com.example.ai_assist.backend.domain.Problem;
import com.example.ai_assist.backend.domain.SessionState;
import com.example.ai_assist.backend.domain.enums.ValidationResult;
import com.example.ai_assist.backend.dto.HintResponse;
import com.example.ai_assist.backend.dto.SignalRequest;
import com.example.ai_assist.backend.engine.ApproachValidationEngine;
import com.example.ai_assist.backend.engine.HintPolicyEngine;
import com.example.ai_assist.backend.engine.IntentDetectionEngine;
import org.springframework.stereotype.Service;

@Service
public class SignalService {

    private final ProblemRegistry registry;
    private final IntentDetectionEngine intentEngine;
    private final ApproachValidationEngine validationEngine;
    private final HintPolicyEngine hintPolicy;
    private final SessionManager sessionManager;

    public SignalService(
            ProblemRegistry registry,
            IntentDetectionEngine intentEngine,
            ApproachValidationEngine validationEngine,
            HintPolicyEngine hintPolicy,
            SessionManager sessionManager
    ) {
        this.registry = registry;
        this.intentEngine = intentEngine;
        this.validationEngine = validationEngine;
        this.hintPolicy = hintPolicy;
        this.sessionManager = sessionManager;
    }

    public HintResponse handleSignal(SignalRequest req) {

        Problem problem = registry.getProblem(req.problemId);
        if (problem == null) {
            return HintResponse.noHint();
        }

        DetectionResult detected = intentEngine.detect(req.signals);

        // Confidence gate
        if (detected.getConfidence() < 0.7) {
            return HintResponse.noHint();
        }

        ValidationResult result =
                validationEngine.validate(
                        problem,
                        new Approach(detected.getApproach())
                );

        SessionState session = sessionManager.getSession(req.sessionId);

        return hintPolicy
                .generateHint(result, detected.getApproach(), session)
                .map(HintResponse::from)
                .orElse(HintResponse.noHint());
    }
}
