package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.ai.model.CodeAnalysisResult;
import com.example.ai_assist.backend.domain.DetectionResult;
import com.example.ai_assist.backend.domain.SignalVector;
import com.example.ai_assist.backend.engine.IntentDetectionEngine;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.Future;

@Component("ruleBasedCodeAnalyzer")
public class RuleBasedCodeAnalyzer implements AiCodeAnalyzer {

    private final IntentDetectionEngine engine;

    public RuleBasedCodeAnalyzer(IntentDetectionEngine engine) {
        this.engine = engine;
    }

    @Override
    @Async
    public Future<CodeAnalysisResult> analyze(String language, String rawCode, SignalVector signalVectorFallback,
            String expectedOptimal, int mistakeCount) {
        // Fallback to old engine
        DetectionResult result = engine.detect(signalVectorFallback);
        return new AsyncResult<>(new CodeAnalysisResult(result.getApproach(), result.getConfidence()));
    }

    @Override
    public Future<String> detectApproach(String language, String rawCode) {
        return new AsyncResult<>("UNKNOWN");
    }

    @Override
    public Future<String> generateHint(String expectedOptimal, String detectedApproach, int mistakeCount) {
        return new AsyncResult<>(null);
    }
}
