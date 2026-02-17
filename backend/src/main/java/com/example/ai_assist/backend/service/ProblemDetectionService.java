package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.ai.AiProblemClassifier;
import com.example.ai_assist.backend.ai.model.ProblemClassificationResult;
import com.example.ai_assist.backend.domain.Problem;
import com.example.ai_assist.backend.domain.context.ProblemContext;
import com.example.ai_assist.backend.domain.enums.ApproachType;
import com.example.ai_assist.backend.domain.enums.ClassificationStatus;
import com.example.ai_assist.backend.dto.ProblemDetectionRequest;
import com.example.ai_assist.backend.dto.ProblemDetectionResponse;
import com.example.ai_assist.backend.repository.ProblemContextRepository;
import com.example.ai_assist.backend.repository.ProblemRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ProblemDetectionService {

    private final ProblemContextRepository repository;
    private final ProblemRepository problemRepository;
    private final AiProblemClassifier classifier;

    public ProblemDetectionService(ProblemContextRepository repository,
            ProblemRepository problemRepository,
            AiProblemClassifier classifier) {
        this.repository = repository;
        this.problemRepository = problemRepository;
        this.classifier = classifier;
    }

    public ProblemDetectionResponse detect(ProblemDetectionRequest request) {

        ProblemContext context = new ProblemContext(
                request.platform(),
                request.title(),
                request.description(),
                request.url());

        // Optimization: check if we already have this problem in our knowledge base
        if (request.id() != null) {
            problemRepository.findById(request.id()).ifPresent(p -> {
                // If it's a known problem, we can set the expected optimal immediately
                if (p.getValidApproaches() != null && !p.getValidApproaches().isEmpty()) {
                    // Just take the first valid approach as the "gold standard" for now
                    ApproachType optimal = p.getValidApproaches().iterator().next();
                    context.setExpectedOptimal(optimal);
                    context.setStatus(ClassificationStatus.COMPLETED);
                    context.setClassificationConfidence(1.0);
                }
            });
        }

        repository.save(context);

        // Still trigger classification if not completed
        if (context.getStatus() == ClassificationStatus.PENDING) {
            processClassification(context.getId(), request.title(), request.description());
        }

        return new ProblemDetectionResponse(
                context.getId(),
                context.getExpectedOptimal() != null ? context.getExpectedOptimal().name() : null,
                context.getClassificationConfidence());
    }

    @Async
    public void processClassification(UUID contextId, String title, String description) {
        try {
            ProblemClassificationResult result = classifier.classify(title, description).get();

            repository.findById(contextId).ifPresent(ctx -> {
                ctx.setExpectedOptimal(result.getExpectedOptimal());
                ctx.setClassificationConfidence(result.getConfidence());
                ctx.setStatus(ClassificationStatus.COMPLETED);
                repository.save(ctx);
            });

        } catch (Exception e) {
            repository.findById(contextId).ifPresent(ctx -> {
                ctx.setStatus(ClassificationStatus.FAILED);
                repository.save(ctx);
            });
            e.printStackTrace();
        }
    }
}
