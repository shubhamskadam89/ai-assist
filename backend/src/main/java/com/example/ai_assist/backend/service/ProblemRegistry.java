package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.domain.Problem;
import com.example.ai_assist.backend.domain.enums.ApproachType;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class ProblemRegistry {

    private final Map<String, Problem> problems = new HashMap<>();

    public ProblemRegistry() {

        // Two Sum
        problems.put(
                "leetcode_1",
                new Problem(
                        "leetcode_1",
                        Set.of(
                                ApproachType.HASHMAP,
                                ApproachType.TWO_POINTER
                        ),
                        Set.of(
                                ApproachType.BRUTE_FORCE
                        )
                )
        );

        // Coin Change
        problems.put(
                "leetcode_322",
                new Problem(
                        "leetcode_322",
                        Set.of(ApproachType.DP),
                        Set.of(ApproachType.GREEDY)
                )
        );
    }

    public Problem getProblem(String id) {
        return problems.get(id);
    }
}
