package com.example.ai_assist.backend.ai;

import com.example.ai_assist.backend.ai.model.CodeAnalysisResult;
import com.example.ai_assist.backend.domain.SignalVector;
import java.util.concurrent.Future;

public interface AiCodeAnalyzer {
    Future<CodeAnalysisResult> analyze(String language, String rawCode, SignalVector signalVectorFallback);
}
