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

        System.out.println("🔥 ANALYZE CALLED");

        ProblemContext context = contextRepository.findById(request.problemContextId())
                .orElseThrow();

        // Save snapshot
        snapshotRepository.save(new CodeSnapshot(
                request.sessionId(),
                context,
                request.language(),
                request.rawCode()
        ));

        System.out.println("📄 Problem: " + context.getDescription());
        System.out.println("💻 Code: " + request.rawCode());

        try {
            String hint = ollamaService.generateHint(
                    context.getDescription(),
                    request.rawCode()
            );

            System.out.println("🤖 OLLAMA RESPONSE: " + hint);

            return new CodeAnalysisResponse(true, "hint", hint);

        } catch (Exception e) {
            e.printStackTrace();
            return new CodeAnalysisResponse(false, null, "Ollama failed");
        }
    }
}
