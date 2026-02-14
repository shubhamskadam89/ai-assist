package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.ai.model.ProblemClassificationResult;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.Future;

@Component("ruleBasedProblemClassifier")
public class RuleBasedProblemClassifier implements AiProblemClassifier {

    @Override
    @Async
    public Future<ProblemClassificationResult> classify(String title, String description) {
        // Stub implementation
        return new AsyncResult<>(new ProblemClassificationResult(null, 0.0, "Rule-based incomplete"));
    }
}
