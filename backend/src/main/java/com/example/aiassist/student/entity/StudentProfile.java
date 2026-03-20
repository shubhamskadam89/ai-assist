package com.example.aiassist.student.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.example.aiassist.problem.entity.ProblemAttempt;

@Entity
@Table(name = "student_profile")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String handle;

    private int totalActiveDays;
    private int maxStreak;
    private int currentStreak;

    private int classTestsTaken;
    private double avgTestScore;

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<StudentPlatformIdentity> platformIdentities = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ProblemAttempt> attempts = new java.util.ArrayList<>();

    public StudentProfile() {
    }

    public StudentProfile(String name, String handle, int totalActiveDays, int maxStreak, int currentStreak,
            int classTestsTaken, double avgTestScore) {
        this.name = name;
        this.handle = handle;
        this.totalActiveDays = totalActiveDays;
        this.maxStreak = maxStreak;
        this.currentStreak = currentStreak;
        this.classTestsTaken = classTestsTaken;
        this.avgTestScore = avgTestScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public int getTotalActiveDays() {
        return totalActiveDays;
    }

    public void setTotalActiveDays(int totalActiveDays) {
        this.totalActiveDays = totalActiveDays;
    }

    public int getMaxStreak() {
        return maxStreak;
    }

    public void setMaxStreak(int maxStreak) {
        this.maxStreak = maxStreak;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getClassTestsTaken() {
        return classTestsTaken;
    }

    public void setClassTestsTaken(int classTestsTaken) {
        this.classTestsTaken = classTestsTaken;
    }

    public double getAvgTestScore() {
        return avgTestScore;
    }

    public void setAvgTestScore(double avgTestScore) {
        this.avgTestScore = avgTestScore;
    }

    public java.util.List<StudentPlatformIdentity> getPlatformIdentities() {
        return platformIdentities;
    }

    public void setPlatformIdentities(java.util.List<StudentPlatformIdentity> platformIdentities) {
        this.platformIdentities = platformIdentities;
    }

    public java.util.List<ProblemAttempt> getAttempts() {
        return attempts;
    }

    public void setAttempts(java.util.List<ProblemAttempt> attempts) {
        this.attempts = attempts;
    }
}
