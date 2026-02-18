package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.dto.CodeAnalysisRequest;
import com.example.ai_assist.backend.dto.CodeAnalysisResponse;
import com.example.ai_assist.backend.service.CodeAnalysisService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "*")
public class CodeController {

    private final CodeAnalysisService service;

    public CodeController(CodeAnalysisService service) {
        this.service = service;
    }

    @PostMapping("/analyze")
    public CodeAnalysisResponse analyze(@RequestBody CodeAnalysisRequest request) {
        return service.analyze(request);
    }
}
