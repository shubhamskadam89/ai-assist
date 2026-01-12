package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.dto.HintResponse;
import com.example.ai_assist.backend.dto.SignalRequest;
import com.example.ai_assist.backend.service.SignalService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@org.springframework.web.bind.annotation.CrossOrigin(origins = "*")
public class SignalController {

    private final SignalService service;

    public SignalController(SignalService service) {
        this.service = service;
    }

    @PostMapping("/signal")
    public HintResponse receiveSignal(@RequestBody SignalRequest request) {
        return service.handleSignal(request);
    }
}
