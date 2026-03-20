package com.example.aiassist.ai.classification.engine;

import com.example.aiassist.ai.classification.dto.ProblemClassificationResult;
import java.util.concurrent.Future;

public interface AiProblemClassifier {
    Future<ProblemClassificationResult> classify(String title, String description);
}
