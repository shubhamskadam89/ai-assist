package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.dto.HintResponse;
import com.example.ai_assist.backend.dto.SignalRequest;
import org.springframework.stereotype.Service;

@Service
public class SignalService {

    public HintResponse handleSignal(SignalRequest req) {

        HintResponse response = new HintResponse();

        response.showHint = true;
        response.level = "MEDIUM";
        response.message = "DP pattern detected. Consider using bottom-up approach.";

        return response;
    }
}
