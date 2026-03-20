package com.example.aiassist.classroom.entity;

import jakarta.persistence.*;
import com.example.aiassist.student.entity.StudentProfile;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter

@NoArgsConstructor
@Table(name = "class_assignment")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id")
    private StudentProfile studentProfile;

    private String problemId; // e.g. "leetcode_1"
    private String category; // e.g. "DSA Assignments" or "Fundamentals"
    private String difficulty; // "Easy", "Medium", "Hard"
    private boolean completed;




}
