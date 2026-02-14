package com.example.ai_assist.backend.repository;

import com.example.ai_assist.backend.domain.context.CodeSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CodeSnapshotRepository extends JpaRepository<CodeSnapshot, UUID> {
}
