package com.example.ai_assist.backend.ai;
import org.springframework.context.annotation.Primary;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class AiConfiguration {

    @Value("${ai.mode:rule}")
    private String mode;

    @Bean
    @Primary
    public AiProblemClassifier problemClassifier(
            RuleBasedProblemClassifier rule
    ) {
        return mode.equalsIgnoreCase("LLM") ? rule : rule;
    }

    @Bean
    @Primary
    public AiCodeAnalyzer codeAnalyzer(
            RuleBasedCodeAnalyzer rule
    ) {
        return mode.equalsIgnoreCase("LLM") ? rule : rule;
    }
}
