package com.example.ai_assist.backend.engine;

import com.example.ai_assist.backend.domain.Approach;
import com.example.ai_assist.backend.domain.Problem;
import com.example.ai_assist.backend.domain.enums.ValidationResult;
import org.springframework.stereotype.Component;

@Component
public class ApproachValidationEngine {

    public ValidationResult validate(Problem problem, Approach detected) {

        if (problem.getValidApproaches().contains(detected.getType())) {
            return ValidationResult.CORRECT;
        }

        if (problem.getInvalidApproaches().contains(detected.getType())) {
            return ValidationResult.WRONG;
        }

        return ValidationResult.SUSPICIOUS;
    }
}
