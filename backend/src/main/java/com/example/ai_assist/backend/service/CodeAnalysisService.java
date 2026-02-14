package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.ai.AiCodeAnalyzer;
import com.example.ai_assist.backend.ai.model.CodeAnalysisResult;
import com.example.ai_assist.backend.domain.Approach;
import com.example.ai_assist.backend.domain.DetectionResult;
import com.example.ai_assist.backend.domain.Problem;
import com.example.ai_assist.backend.domain.SessionState;
import com.example.ai_assist.backend.domain.context.CodeSnapshot;
import com.example.ai_assist.backend.domain.context.ProblemContext;
import com.example.ai_assist.backend.domain.enums.ValidationResult;
import com.example.ai_assist.backend.dto.CodeAnalysisRequest;
import com.example.ai_assist.backend.dto.CodeAnalysisResponse;
import com.example.ai_assist.backend.engine.ApproachValidationEngine;
import com.example.ai_assist.backend.engine.HintPolicyEngine;
import com.example.ai_assist.backend.repository.CodeSnapshotRepository;
import com.example.ai_assist.backend.repository.ProblemContextRepository;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ExecutionException;

@Service
public class CodeAnalysisService {

    private final ProblemContextRepository contextRepository;
    private final CodeSnapshotRepository snapshotRepository;
    private final SessionManager sessionManager;
    private final AiCodeAnalyzer codeAnalyzer;
    private final ApproachValidationEngine validationEngine;
    private final HintPolicyEngine hintPolicy;

    public CodeAnalysisService(
            ProblemContextRepository contextRepository,
            CodeSnapshotRepository snapshotRepository,
            SessionManager sessionManager,
            AiCodeAnalyzer codeAnalyzer,
            ApproachValidationEngine validationEngine,
            HintPolicyEngine hintPolicy) {
        this.contextRepository = contextRepository;
        this.snapshotRepository = snapshotRepository;
        this.sessionManager = sessionManager;
        this.codeAnalyzer = codeAnalyzer;
        this.validationEngine = validationEngine;
        this.hintPolicy = hintPolicy;
    }

    public CodeAnalysisResponse analyze(CodeAnalysisRequest request) {

        ProblemContext context = contextRepository.findById(request.problemContextId())
                .orElseThrow();

        // 1. Persist Code Snapshot
        snapshotRepository.save(new CodeSnapshot(
                request.sessionId(),
                context,
                request.language(),
                request.rawCode()));

        SessionState session = sessionManager.getSession(request.sessionId());

        // 2. AI Analysis (Async but blocking here for response, can be decoupled
        // further if needed)
        // In this Flow B, we likely need the result to send the hint back immediately,
        // or we could use WebSockets for truly async hints.
        // For now, we block lightly since the LLM client returns a Future.

        CodeAnalysisResult detected;
        try {
            detected = codeAnalyzer.analyze(
                    request.language(),
                    request.rawCode(),
                    request.signalVector()).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return new CodeAnalysisResponse(false, null, "Analysis failed");
        }

        if (context.getExpectedOptimal() == null) {
            // Problem not classified yet
            return new CodeAnalysisResponse(false, null, null);
        }

        ValidationResult result = validationEngine.validate(
                new Problem(
                        context.getId().toString(),
                        Set.of(context.getExpectedOptimal()),
                        Set.of()),
                new Approach(detected.getDetectedApproach()));

        return hintPolicy
                .generateHint(result, detected.getDetectedApproach(), session)
                .map(h -> new CodeAnalysisResponse(true, h.getLevel(), h.getMessage()))
                .orElse(new CodeAnalysisResponse(false, null, null));
    }
}
