package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.ai.AiProblemClassifier;
import com.example.ai_assist.backend.ai.model.ProblemClassificationResult;
import com.example.ai_assist.backend.domain.context.ProblemContext;
import com.example.ai_assist.backend.domain.enums.ClassificationStatus;
import com.example.ai_assist.backend.dto.ProblemDetectionRequest;
import com.example.ai_assist.backend.dto.ProblemDetectionResponse;
import com.example.ai_assist.backend.repository.ProblemContextRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ProblemDetectionService {

    private final ProblemContextRepository repository;
    private final AiProblemClassifier classifier;

    public ProblemDetectionService(ProblemContextRepository repository,
            AiProblemClassifier classifier) {
        this.repository = repository;
        this.classifier = classifier;
    }

    public ProblemDetectionResponse detect(ProblemDetectionRequest request) {

        ProblemContext context = new ProblemContext(
                request.platform(),
                request.title(),
                request.description(),
                request.url());

        repository.save(context);

        // Trigger async classification
        processClassification(context.getId(), request.title(), request.description());

        // Return immediately with PENDING status
        return new ProblemDetectionResponse(
                context.getId(),
                null,
                0.0);
    }

    @Async
    public void processClassification(UUID contextId, String title, String description) {
        try {
            // This future is already async from the AI component, but we wrap logic here
            // to update the DB when done.
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
            // Log error
            e.printStackTrace();
        }
    }
}
