package com.example.ai_assist.backend.api;
import com.example.ai_assist.backend.dto.HintResponse;
import com.example.ai_assist.backend.dto.SignalRequest;
import com.example.ai_assist.backend.service.SignalService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SignalController {

    private final SignalService signalService;

    public SignalController(SignalService signalService) {
        this.signalService = signalService;
    }

    @PostMapping("/signal")
    public HintResponse handleSignal(@RequestBody SignalRequest req) {
        return signalService.handleSignal(req);
    }
}
