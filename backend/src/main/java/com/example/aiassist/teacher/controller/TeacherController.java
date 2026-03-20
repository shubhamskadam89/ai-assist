package com.example.aiassist.teacher.controller;

import com.example.aiassist.common.response.ApiResponse;
import com.example.aiassist.teacher.dto.TeacherRequestDTO;
import com.example.aiassist.teacher.dto.TeacherResponseDTO;
import com.example.aiassist.teacher.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping
    public ApiResponse<TeacherResponseDTO> create(
            @Valid @RequestBody TeacherRequestDTO request) {

        return ApiResponse.success(
                teacherService.createTeacher(request),
                "Teacher created successfully"
        );
    }

    @GetMapping
    public ApiResponse<List<TeacherResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ApiResponse.success(
                teacherService.getAllTeachers(page, size)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<TeacherResponseDTO> get(@PathVariable Long id) {

        return ApiResponse.success(
                teacherService.getTeacher(id)
        );
    }
}