package com.example.aiassist.tracking.service;

import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.problem.entity.ProblemAttempt;
import com.example.aiassist.problem.repository.ProblemAttemptRepository;
import com.example.aiassist.student.dto.ProblemAttemptResponseDTO;
import com.example.aiassist.student.dto.ProblemTrackingRequest;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.student.repository.StudentProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrackingService {

    private final StudentProfileRepository studentRepository;
    private final ProblemAttemptRepository attemptRepository;

    public TrackingService(StudentProfileRepository studentRepository,
                           ProblemAttemptRepository attemptRepository) {
        this.studentRepository = studentRepository;
        this.attemptRepository = attemptRepository;
    }

    public ProblemAttemptResponseDTO logAttempt(ProblemTrackingRequest request) {

        StudentProfile profile = studentRepository.findByHandle(request.getHandle())
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setHandle(request.getHandle());
                    newProfile.setName("New Student");
                    newProfile.setCurrentStreak(0);
                    newProfile.setMaxStreak(0);
                    newProfile.setTotalActiveDays(0);
                    return studentRepository.save(newProfile);
                });

        ProblemAttempt attempt = new ProblemAttempt(
                profile,
                request.getPlatform(),
                request.getProblemId(),
                request.getDifficulty(),
                request.getHintsUsed(),
                request.isCompleted(),
                LocalDateTime.now()
        );

        ProblemAttempt saved = attemptRepository.save(attempt);

        return mapToResponse(saved);
    }

    public List<ProblemAttemptResponseDTO> getAttemptsByStudent(
            Long studentId,
            int page,
            int size) {

        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return attemptRepository
                .findByStudentProfileIdOrderByTimestampDesc(
                        studentId,
                        PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProblemAttemptResponseDTO mapToResponse(ProblemAttempt attempt) {
        return new ProblemAttemptResponseDTO(
                attempt.getId(),
                attempt.getStudentProfile().getHandle(),
                attempt.getPlatform(),
                attempt.getProblemId(),
                attempt.getDifficulty(),
                attempt.getHintsUsed(),
                attempt.isCompleted(),
                attempt.getTimestamp()
        );
    }
}