package com.example.ai_assist.backend.dto;

import com.example.ai_assist.backend.domain.SignalVector;

public class SignalRequest {

    public String sessionId;
    public String problemId;
    public String language;
    public SignalVector signals;
}

