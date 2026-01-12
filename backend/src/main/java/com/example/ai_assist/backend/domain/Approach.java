package com.example.ai_assist.backend.domain;

import com.example.ai_assist.backend.domain.enums.ApproachType;

public class Approach {

    private final ApproachType type;

    public Approach(ApproachType type) {
        this.type = type;
    }

    public ApproachType getType() {
        return type;
    }
}
