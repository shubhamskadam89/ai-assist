package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.domain.Problem;
import org.springframework.stereotype.Service;

@Service
public class ProblemRegistry {

        private final com.example.ai_assist.backend.repository.ProblemRepository problemRepository;

        public ProblemRegistry(com.example.ai_assist.backend.repository.ProblemRepository problemRepository) {
                this.problemRepository = problemRepository;
        }

        public Problem getProblem(String id) {
                return problemRepository.findById(id).orElse(null);
        }
}
