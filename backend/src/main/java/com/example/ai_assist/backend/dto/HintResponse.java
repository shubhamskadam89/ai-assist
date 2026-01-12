package com.example.ai_assist.backend.dto;

import com.example.ai_assist.backend.domain.Hint;

public class HintResponse {

    public boolean showHint;
    public String level;
    public String message;

    public static HintResponse noHint() {
        HintResponse r = new HintResponse();
        r.showHint = false;
        return r;
    }

    public static HintResponse from(Hint h) {
        HintResponse r = new HintResponse();
        r.showHint = true;
        r.level = h.getLevel();
        r.message = h.getMessage();
        return r;
    }
}

