package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.domain.context.CodeSnapshot;
import com.example.ai_assist.backend.domain.context.ProblemContext;
import com.example.ai_assist.backend.dto.CodeAnalysisRequest;
import com.example.ai_assist.backend.dto.CodeAnalysisResponse;
import com.example.ai_assist.backend.repository.CodeSnapshotRepository;
import com.example.ai_assist.backend.repository.ProblemContextRepository;
import org.springframework.stereotype.Service;

@Service
public class CodeAnalysisService {

    private final ProblemContextRepository contextRepository;
    private final CodeSnapshotRepository snapshotRepository;
    private final OllamaService ollamaService;

    public CodeAnalysisService(
            ProblemContextRepository contextRepository,
            CodeSnapshotRepository snapshotRepository,
            OllamaService ollamaService
    ) {
        this.contextRepository = contextRepository;
        this.snapshotRepository = snapshotRepository;
        this.ollamaService = ollamaService;
    }

    public CodeAnalysisResponse analyze(CodeAnalysisRequest request) {

        System.out.println("[ANALYZE] CALLED");

        if (request.getProblemContextId() == null) {
            System.err.println("[ERROR] Problem Context ID is null");
            return new CodeAnalysisResponse(false, null, "Problem context missing");
        }

        ProblemContext context = contextRepository.findById(request.getProblemContextId())
                .orElse(null);

        if (context == null) {
            System.err.println("[ERROR] Context not found for ID: " + request.getProblemContextId());
            return new CodeAnalysisResponse(false, null, "Problem context not found");
        }

        // Save snapshot
        snapshotRepository.save(new CodeSnapshot(
                request.getSessionId(),
                context,
                request.getLanguage(),
                request.getRawCode()
        ));

        System.out.println("[Problem] " + context.getDescription());
        System.out.println("[Code] " + request.getRawCode());

        try {
            String hint = ollamaService.generateHint(
                    context.getDescription(),
                    request.getRawCode()
            );

            System.out.println("[OLLAMA] RESPONSE: " + hint);

            return new CodeAnalysisResponse(true, "hint", hint);

        } catch (Exception e) {
            e.printStackTrace();
            return new CodeAnalysisResponse(false, null, "Ollama failed");
        }
    }
}
