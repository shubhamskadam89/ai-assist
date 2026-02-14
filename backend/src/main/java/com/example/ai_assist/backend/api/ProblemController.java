package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.dto.ProblemDetectionRequest;
import com.example.ai_assist.backend.dto.ProblemDetectionResponse;
import com.example.ai_assist.backend.service.ProblemDetectionService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/problem")
@CrossOrigin(origins = "*")
public class ProblemController {

    private final ProblemDetectionService service;

    public ProblemController(ProblemDetectionService service) {
        this.service = service;
    }

    @PostMapping("/detect")
    public ProblemDetectionResponse detect(
            @RequestBody ProblemDetectionRequest request) {
        return service.detect(request);
    }
}
