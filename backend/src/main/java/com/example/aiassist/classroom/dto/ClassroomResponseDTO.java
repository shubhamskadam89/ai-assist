package com.example.aiassist.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@RequiredArgsConstructor
public class ClassroomResponseDTO {

    private Long id;
    private String name;
    private String joinCode;
    private String teacherName;
    private int studentCount;
    private LocalDateTime createdAt;


}