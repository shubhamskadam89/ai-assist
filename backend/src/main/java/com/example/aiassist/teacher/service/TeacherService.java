package com.example.aiassist.teacher.service;

import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.teacher.dto.TeacherRequestDTO;
import com.example.aiassist.teacher.dto.TeacherResponseDTO;
import com.example.aiassist.teacher.repository.TeacherRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    public TeacherResponseDTO createTeacher(TeacherRequestDTO request) {

        teacherRepository.findByEmail(request.getEmail())
                .ifPresent(t -> {
                    throw new BadRequestException("Teacher with this email already exists");
                });

        Teacher teacher = new Teacher(
                request.getName(),
                request.getEmail(),
                request.getDepartment()
        );

        Teacher saved = teacherRepository.save(teacher);

        return mapToResponse(saved);
    }

    public List<TeacherResponseDTO> getAllTeachers(int page, int size) {

        return teacherRepository
                .findAll(PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TeacherResponseDTO getTeacher(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        return mapToResponse(teacher);
    }

    private TeacherResponseDTO mapToResponse(Teacher teacher) {
        return new TeacherResponseDTO(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail(),
                teacher.getDepartment(),
                teacher.getClassrooms() == null ? 0 : teacher.getClassrooms().size()
        );
    }
}