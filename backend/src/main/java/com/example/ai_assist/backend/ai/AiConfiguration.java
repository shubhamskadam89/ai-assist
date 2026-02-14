package com.example.ai_assist.backend.ai;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class AiConfiguration {

    @Value("${ai.mode}")
    private String mode;

    @Bean
    public AiProblemClassifier problemClassifier(
            RuleBasedProblemClassifier rule
    // LlmProblemClassifierClient llm (future)
    ) {
        return mode.equalsIgnoreCase("LLM") ? rule : rule; // Fallback to rule for now until LLM client is ready
    }

    @Bean
    public AiCodeAnalyzer codeAnalyzer(
            RuleBasedCodeAnalyzer rule
    // LlmCodeAnalyzerClient llm (future)
    ) {
        return mode.equalsIgnoreCase("LLM") ? rule : rule;
    }
}
