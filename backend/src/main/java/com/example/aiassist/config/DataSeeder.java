package com.example.aiassist.config;

import com.example.aiassist.problem.entity.Problem;
import com.example.aiassist.signal.model.ApproachType;
import com.example.aiassist.problem.repository.ProblemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProblemRepository problemRepository;

    public DataSeeder(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (problemRepository.count() == 0) {
            System.out.println("Seeding initial problems...");

            // Two Sum
            problemRepository.save(new Problem(
                    "leetcode_1",
                    Set.of(ApproachType.HASHMAP, ApproachType.TWO_POINTER),
                    Set.of(ApproachType.BRUTE_FORCE)));

            // Coin Change
            problemRepository.save(new Problem(
                    "leetcode_322",
                    Set.of(ApproachType.DP),
                    Set.of(ApproachType.GREEDY)));

            System.out.println("Problem seeding completed.");
        }
    }
}
