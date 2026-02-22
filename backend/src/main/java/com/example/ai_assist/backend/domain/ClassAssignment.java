package com.example.ai_assist.backend.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "class_assignment")
public class ClassAssignment {

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

    public ClassAssignment() {
    }

    public ClassAssignment(StudentProfile studentProfile, String problemId, String category, String difficulty,
            boolean completed) {
        this.studentProfile = studentProfile;
        this.problemId = problemId;
        this.category = category;
        this.difficulty = difficulty;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
    }

    public String getProblemId() {
        return problemId;
    }

    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
