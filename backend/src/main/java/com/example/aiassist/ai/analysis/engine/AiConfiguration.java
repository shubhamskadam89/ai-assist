package com.example.aiassist.ai.analysis.engine;

import org.springframework.context.annotation.Primary;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import com.example.aiassist.ai.classification.engine.AiProblemClassifier;
import com.example.aiassist.ai.classification.engine.RuleBasedProblemClassifier;

@Configuration
public class AiConfiguration {

    @Value("${ai.mode:rule}")
    private String mode;

    @Bean
    @Primary
    public AiProblemClassifier problemClassifier(
            RuleBasedProblemClassifier rule) {
        return mode.equalsIgnoreCase("LLM") ? rule : rule;
    }

    @Bean
    @Primary
    public AiCodeAnalyzer codeAnalyzer(
            RuleBasedCodeAnalyzer rule) {
        return mode.equalsIgnoreCase("LLM") ? rule : rule;
    }
}
