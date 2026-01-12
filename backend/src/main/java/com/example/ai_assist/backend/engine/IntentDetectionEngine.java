package com.example.ai_assist.backend.engine;

import com.example.ai_assist.backend.domain.DetectionResult;
import com.example.ai_assist.backend.domain.SignalVector;
import com.example.ai_assist.backend.domain.enums.ApproachType;
import org.springframework.stereotype.Component;

@Component
public class IntentDetectionEngine {

    public DetectionResult detect(SignalVector s) {

        // Dynamic Programming
        if (s.hasDPArray) {
            return new DetectionResult(ApproachType.DP, 0.9);
        }

        // Greedy (Coin Change classic failure)
        if (s.usesSort && !s.hasRecursion && !s.hasDPArray) {
            return new DetectionResult(ApproachType.GREEDY, 0.75);
        }

        // HashMap (Two Sum canonical solution)
        if (!s.usesSort && s.loopDepth == 1 && !s.hasRecursion) {
            return new DetectionResult(ApproachType.HASHMAP, 0.75);
        }

        // Brute force (nested loops)
        if (s.loopDepth >= 2 && !s.usesSort && !s.hasRecursion) {
            return new DetectionResult(ApproachType.BRUTE_FORCE, 0.8);
        }

        return new DetectionResult(ApproachType.UNKNOWN, 0.3);
    }
}
