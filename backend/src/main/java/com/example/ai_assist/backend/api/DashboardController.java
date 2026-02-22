package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.domain.ProblemAttempt;
import com.example.ai_assist.backend.domain.StudentProfile;
import com.example.ai_assist.backend.dto.DashboardStatsResponse;
import com.example.ai_assist.backend.repository.ProblemAttemptRepository;
import com.example.ai_assist.backend.repository.StudentProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*") // Allows extension frontend to hit this API easily
public class DashboardController {

        private final StudentProfileRepository studentProfileRepository;
        private final ProblemAttemptRepository problemAttemptRepository;

        public DashboardController(StudentProfileRepository studentProfileRepository,
                        ProblemAttemptRepository problemAttemptRepository) {
                this.studentProfileRepository = studentProfileRepository;
                this.problemAttemptRepository = problemAttemptRepository;
        }

        @GetMapping("/stats/{handle}")
        public ResponseEntity<DashboardStatsResponse> getDashboardStats(@PathVariable String handle) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(handle);

                if (profileOpt.isEmpty()) {
                        // Return an empty template rather than 404 so dashboard can still load
                        DashboardStatsResponse empty = new DashboardStatsResponse();
                        empty.setStudentName("New Student");
                        empty.setHandle(handle);
                        empty.setTotalActiveDays(0);
                        empty.setMaxStreak(0);
                        empty.setCurrentStreak(0);
                        empty.setClassTestsTaken(0);
                        empty.setAvgTestScore(0);
                        empty.setDsaStats(Arrays.asList(
                                        Map.of("name", "Easy", "value", 0, "color", "#10b981"),
                                        Map.of("name", "Medium", "value", 0, "color", "#eab308"),
                                        Map.of("name", "Hard", "value", 0, "color", "#ef4444")));
                        empty.setFundamentalsStats(List.of(
                                        Map.of("name", "Completed", "value", 0, "color", "#10b981")));
                        return ResponseEntity.ok(empty);
                }

                StudentProfile profile = profileOpt.get();
                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(profile.getId());

                DashboardStatsResponse response = new DashboardStatsResponse();
                response.setStudentName(profile.getName());
                response.setHandle(profile.getHandle());
                response.setTotalActiveDays(profile.getTotalActiveDays());
                response.setMaxStreak(profile.getMaxStreak());
                response.setCurrentStreak(profile.getCurrentStreak());
                response.setClassTestsTaken(profile.getClassTestsTaken());
                response.setAvgTestScore(profile.getAvgTestScore());

                // Process DSA Stats (Easy, Medium, Hard) - Use all problem attempts for the DSA
                // donut
                long easyCount = attempts.stream()
                                .filter(a -> "Easy".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();
                long mediumCount = attempts.stream()
                                .filter(a -> "Medium".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();
                long hardCount = attempts.stream()
                                .filter(a -> "Hard".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();

                List<Map<String, Object>> dsaStats = Arrays.asList(
                                Map.of("name", "Easy", "value", easyCount, "color", "#10b981"),
                                Map.of("name", "Medium", "value", mediumCount, "color", "#eab308"),
                                Map.of("name", "Hard", "value", hardCount, "color", "#ef4444"));
                response.setDsaStats(dsaStats);

                // Process Fundamentals (Mock this out for now or compute based on another
                // metric)
                response.setFundamentalsStats(List.of(
                                Map.of("name", "Completed", "value", attempts.size(), "color", "#10b981")));

                return ResponseEntity.ok(response);
        }
}
