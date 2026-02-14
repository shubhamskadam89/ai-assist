package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.ai.model.ProblemClassificationResult;
import java.util.concurrent.Future;

public interface AiProblemClassifier {
    Future<ProblemClassificationResult> classify(String title, String description);
}
