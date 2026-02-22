package com.example.ai_assist.backend.repository;

import com.example.ai_assist.backend.domain.ClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassAssignmentRepository extends JpaRepository<ClassAssignment, Long> {
    List<ClassAssignment> findByStudentProfileId(Long studentProfileId);
}
