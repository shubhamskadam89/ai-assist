package com.example.ai_assist.backend.ai;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class AiConfiguration {

    @Value("${ai.mode}")
    private String mode;

    @Bean
    @Primary
    public AiProblemClassifier problemClassifier(
            RuleBasedProblemClassifier rule,
            PythonAiProblemClassifier python) {
        return "LLM".equalsIgnoreCase(mode) ? python : rule;
    }

    @Bean
    @Primary
    public AiCodeAnalyzer codeAnalyzer(
            RuleBasedCodeAnalyzer rule,
            PythonAiCodeAnalyzer python) {
        return "LLM".equalsIgnoreCase(mode) ? python : rule;
    }
}
