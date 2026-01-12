package com.example.ai_assist.backend.domain;

import com.example.ai_assist.backend.domain.enums.ApproachType;

import java.util.Set;

public class Problem {

    private final String problemId;
    private final Set<ApproachType> validApproaches;
    private final Set<ApproachType> invalidApproaches;

    public Problem(String problemId,
                   Set<ApproachType> valid,
                   Set<ApproachType> invalid) {
        this.problemId = problemId;
        this.validApproaches = valid;
        this.invalidApproaches = invalid;
    }

    public Set<ApproachType> getValidApproaches() {
        return validApproaches;
    }

    public Set<ApproachType> getInvalidApproaches() {
        return invalidApproaches;
    }
}
