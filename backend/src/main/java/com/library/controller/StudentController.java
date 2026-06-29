package com.library.controller;

import com.library.dto.Dtos.ProfileResponse;
import com.library.service.StudentService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
public class StudentController {
  private final StudentService studentService;

  public StudentController(StudentService studentService) {
    this.studentService = studentService;
  }

  @GetMapping
  @PreAuthorize("hasRole('LIBRARIAN')")
  public List<ProfileResponse> listStudents() {
    return studentService.listStudents();
  }
}
