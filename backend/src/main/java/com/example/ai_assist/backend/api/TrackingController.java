package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.domain.ProblemAttempt;
import com.example.ai_assist.backend.domain.StudentProfile;
import com.example.ai_assist.backend.dto.ProblemTrackingRequest;
import com.example.ai_assist.backend.repository.ProblemAttemptRepository;
import com.example.ai_assist.backend.repository.StudentProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tracking")
@CrossOrigin(origins = "*") // Allows extension frontend to hit this API easily
public class TrackingController {

    private final StudentProfileRepository studentProfileRepository;
    private final ProblemAttemptRepository problemAttemptRepository;

    public TrackingController(StudentProfileRepository studentProfileRepository,
            ProblemAttemptRepository problemAttemptRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.problemAttemptRepository = problemAttemptRepository;
    }

    @PostMapping("/attempt")
    public ResponseEntity<String> logAttempt(@RequestBody ProblemTrackingRequest request) {

        // Find existing student profile
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(request.getHandle());

        StudentProfile profile;
        if (profileOpt.isEmpty()) {
            // Auto-create profile if doesn't exist for test purposes / smooth onboarding
            profile = new StudentProfile();
            profile.setHandle(request.getHandle());
            profile.setName("New Student");
            profile.setMaxStreak(1);
            profile.setCurrentStreak(1);
            profile.setTotalActiveDays(1);
            studentProfileRepository.save(profile);
        } else {
            profile = profileOpt.get();
        }

        // Create Attempt Record
        ProblemAttempt attempt = new ProblemAttempt(
                profile,
                request.getPlatform(),
                request.getProblemId(),
                request.getDifficulty(),
                request.getHintsUsed(),
                request.isCompleted(),
                LocalDateTime.now());

        problemAttemptRepository.save(attempt);

        return ResponseEntity.ok("Attempt logged successfully");
    }
}
