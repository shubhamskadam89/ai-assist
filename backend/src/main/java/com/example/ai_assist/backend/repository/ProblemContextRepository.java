package com.example.ai_assist.backend.repository;

import com.example.ai_assist.backend.domain.context.ProblemContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ProblemContextRepository extends JpaRepository<ProblemContext, UUID> {
}
