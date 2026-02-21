package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.ai.AiCodeAnalyzer;
import com.example.ai_assist.backend.ai.AiProblemClassifier;
import com.example.ai_assist.backend.ai.model.ProblemClassificationResult;
import com.example.ai_assist.backend.domain.SessionState;
import com.example.ai_assist.backend.domain.context.CodeSnapshot;
import com.example.ai_assist.backend.domain.context.ProblemContext;
import com.example.ai_assist.backend.domain.enums.ApproachType;
import com.example.ai_assist.backend.domain.enums.ClassificationStatus;
import com.example.ai_assist.backend.dto.CodeAnalysisRequest;
import com.example.ai_assist.backend.dto.CodeAnalysisResponse;
import com.example.ai_assist.backend.repository.CodeSnapshotRepository;
import com.example.ai_assist.backend.repository.ProblemContextRepository;
import org.springframework.stereotype.Service;
import java.util.concurrent.ExecutionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CodeAnalysisService {

        private static final Logger log = LoggerFactory.getLogger(CodeAnalysisService.class);

        private final ProblemContextRepository contextRepository;
        private final CodeSnapshotRepository snapshotRepository;
        private final SessionManager sessionManager;
        private final AiCodeAnalyzer codeAnalyzer;
        private final AiProblemClassifier problemClassifier;

        public CodeAnalysisService(
                        ProblemContextRepository contextRepository,
                        CodeSnapshotRepository snapshotRepository,
                        SessionManager sessionManager,
                        AiCodeAnalyzer codeAnalyzer,
                        AiProblemClassifier problemClassifier) {
                this.contextRepository = contextRepository;
                this.snapshotRepository = snapshotRepository;
                this.sessionManager = sessionManager;
                this.codeAnalyzer = codeAnalyzer;
                this.problemClassifier = problemClassifier;
        }

        public CodeAnalysisResponse analyze(CodeAnalysisRequest request) {
                log.info("Received analysis request: sessionId={}, problemContextId={}, language={}",
                                request.sessionId(), request.problemContextId(), request.language());

                var contextOptional = contextRepository.findById(request.problemContextId());
                if (contextOptional.isEmpty()) {
                        log.warn("Problem context not found: {}", request.problemContextId());
                        return new CodeAnalysisResponse(false, null,
                                        "Problem context not found. Please refresh the page.");
                }
                ProblemContext context = contextOptional.get();

                // 1. Persist Code Snapshot
                snapshotRepository.save(new CodeSnapshot(
                                request.sessionId(),
                                context,
                                request.language(),
                                request.rawCode()));

                SessionState session = sessionManager.getSession(request.sessionId());

                // 2. Stability Check (Hashing)
                String currentCodeHash = calculateHash(request.rawCode());
                if (currentCodeHash.equals(session.getLastCodeHash())) {
                        log.info("Code unchanged (hash match), skipping AI call.");
                        return new CodeAnalysisResponse(false, null, null);
                }
                session.setLastCodeHash(currentCodeHash);

                // 3. Phase A: Detection Only
                String detectedApproachStr;
                try {
                        detectedApproachStr = codeAnalyzer.detectApproach(request.language(), request.rawCode()).get();
                        log.info("Phase A: Detected approach: {}", detectedApproachStr);
                } catch (InterruptedException | ExecutionException e) {
                        log.error("Detection failed", e);
                        return new CodeAnalysisResponse(false, null, "Detection failed");
                }

                ApproachType detectedApproach = mapToApproachType(detectedApproachStr);

                // 4. Get expectedOptimal — classify on-demand if Ollama hasn't finished yet
                ApproachType expectedOptimal = context.getExpectedOptimal();
                if (expectedOptimal == null) {
                        log.info("expectedOptimal is null — classifying problem on-demand via AI: title='{}'",
                                        context.getTitle());
                        try {
                                ProblemClassificationResult classification = problemClassifier
                                                .classify(context.getTitle(), context.getDescription()).get();
                                expectedOptimal = classification.getExpectedOptimal();
                                if (expectedOptimal != null) {
                                        context.setExpectedOptimal(expectedOptimal);
                                        context.setClassificationConfidence(classification.getConfidence());
                                        context.setStatus(ClassificationStatus.COMPLETED);
                                        contextRepository.save(context);
                                        log.info("On-demand classification complete: expectedOptimal={}, confidence={}",
                                                        expectedOptimal, classification.getConfidence());
                                }
                        } catch (InterruptedException | ExecutionException e) {
                                log.error("On-demand classification failed", e);
                        }
                }

                if (expectedOptimal == null) {
                        log.warn("Classification still pending, cannot generate hint yet.");
                        return new CodeAnalysisResponse(true, "CLASSIFYING",
                                        "⏳ Analyzing this problem with AI... Hint will appear on next code change.");
                }

                if (detectedApproach == expectedOptimal) {
                        log.info("Student is aligned with optimal approach: {}", expectedOptimal);
                        session.resetMistakes();
                        session.setLastDetectedApproach(detectedApproach);
                        // Show positive feedback so the overlay is never empty
                        return new CodeAnalysisResponse(true, "GREAT_JOB",
                                        "✅ Great approach! You're using " + expectedOptimal.name() +
                                                        " which is the optimal strategy for this problem. Keep going!");
                }

                // Misaligned!
                if (detectedApproach != session.getLastDetectedApproach()) {
                        log.info("New approach detected ({} -> {}), resetting mistake count",
                                        session.getLastDetectedApproach(), detectedApproach);
                        session.resetMistakes();
                }

                session.setLastDetectedApproach(detectedApproach);
                session.incrementMistake();
                int mistakes = session.getSameMistakeCount();

                log.info("Student misaligned: detected={}, expected={}, sameMistakeCount={}",
                                detectedApproach, expectedOptimal, mistakes);

                // 5. Phase B: Conditional Hint Generation
                // Threshold: hint after 1st misaligned poll (immediate feedback for testing)
                if (mistakes >= 1) {
                        try {
                                String hint = codeAnalyzer.generateHint(
                                                expectedOptimal.name(),
                                                detectedApproach.name(),
                                                mistakes).get();

                                return new CodeAnalysisResponse(true, "AI_GUIDANCE", hint);
                        } catch (InterruptedException | ExecutionException e) {
                                log.error("Hint generation failed", e);
                                return new CodeAnalysisResponse(false, null, null);
                        }
                }

                return new CodeAnalysisResponse(false, null, null);
        }

        private String calculateHash(String input) {
                if (input == null)
                        return "";
                try {
                        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                        byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                        StringBuilder hexString = new StringBuilder();
                        for (byte b : hash) {
                                String hex = Integer.toHexString(0xff & b);
                                if (hex.length() == 1)
                                        hexString.append('0');
                                hexString.append(hex);
                        }
                        return hexString.toString();
                } catch (Exception e) {
                        return String.valueOf(input.hashCode());
                }
        }

        private ApproachType mapToApproachType(String approach) {
                if (approach == null)
                        return ApproachType.UNKNOWN;
                try {
                        return ApproachType.valueOf(approach.toUpperCase());
                } catch (IllegalArgumentException e) {
                        // Heuristic fallback matching mapApproach in PythonAiCodeAnalyzer
                        String upper = approach.toUpperCase();
                        if (upper.contains("BRUTE"))
                                return ApproachType.BRUTE_FORCE;
                        if (upper.contains("HASH") || upper.contains("MAP"))
                                return ApproachType.HASHMAP;
                        if (upper.contains("DFS"))
                                return ApproachType.DFS;
                        if (upper.contains("GREEDY"))
                                return ApproachType.GREEDY;
                        if (upper.contains("DP") || upper.contains("DYNAMIC"))
                                return ApproachType.DP;
                        return ApproachType.UNKNOWN;
                }
        }
}
