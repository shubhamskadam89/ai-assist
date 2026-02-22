package com.example.ai_assist.backend.repository;

import com.example.ai_assist.backend.domain.ProblemAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {
    List<ProblemAttempt> findByStudentProfileId(Long studentProfileId);
}
