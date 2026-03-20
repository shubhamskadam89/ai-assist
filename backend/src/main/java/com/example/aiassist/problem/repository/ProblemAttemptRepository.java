package com.example.aiassist.problem.repository;

import com.example.aiassist.problem.entity.ProblemAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {

    Page<ProblemAttempt> findByStudentProfileIdOrderByTimestampDesc(
            Long studentProfileId,
            Pageable pageable);

    java.util.List<ProblemAttempt> findByStudentProfileId(Long studentProfileId);
}