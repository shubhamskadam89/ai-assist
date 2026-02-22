package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.domain.ClassAssignment;
import com.example.ai_assist.backend.domain.StudentProfile;
import com.example.ai_assist.backend.dto.DashboardStatsResponse;
import com.example.ai_assist.backend.repository.ClassAssignmentRepository;
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
    private final ClassAssignmentRepository classAssignmentRepository;

    public DashboardController(StudentProfileRepository studentProfileRepository,
            ClassAssignmentRepository classAssignmentRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.classAssignmentRepository = classAssignmentRepository;
    }

    @GetMapping("/stats/{handle}")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(@PathVariable String handle) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(handle);

        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        List<ClassAssignment> assignments = classAssignmentRepository.findByStudentProfileId(profile.getId());

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setStudentName(profile.getName());
        response.setHandle(profile.getHandle());
        response.setTotalActiveDays(profile.getTotalActiveDays());
        response.setMaxStreak(profile.getMaxStreak());
        response.setCurrentStreak(profile.getCurrentStreak());
        response.setClassTestsTaken(profile.getClassTestsTaken());
        response.setAvgTestScore(profile.getAvgTestScore());

        // Process DSA Stats (Easy, Medium, Hard)
        List<ClassAssignment> dsaAssignments = assignments.stream()
                .filter(a -> "DSA Assignments".equalsIgnoreCase(a.getCategory()))
                .collect(Collectors.toList());

        long easyCount = dsaAssignments.stream()
                .filter(a -> "Easy".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();
        long mediumCount = dsaAssignments.stream()
                .filter(a -> "Medium".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();
        long hardCount = dsaAssignments.stream()
                .filter(a -> "Hard".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();

        List<Map<String, Object>> dsaStats = Arrays.asList(
                Map.of("name", "Easy", "value", easyCount, "color", "#10b981"),
                Map.of("name", "Medium", "value", mediumCount, "color", "#eab308"),
                Map.of("name", "Hard", "value", hardCount, "color", "#ef4444"));
        response.setDsaStats(dsaStats);

        // Process Fundamentals
        List<ClassAssignment> funcAssignments = assignments.stream()
                .filter(a -> "Fundamentals".equalsIgnoreCase(a.getCategory()) && a.isCompleted())
                .collect(Collectors.toList());

        response.setFundamentalsStats(List.of(
                Map.of("name", "Completed", "value", funcAssignments.size(), "color", "#10b981")));

        return ResponseEntity.ok(response);
    }
}
