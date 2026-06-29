package com.library.service;

import static com.library.mapper.ApiMapper.toProfileResponse;

import com.library.dto.Dtos.ProfileResponse;
import com.library.model.UserRole;
import com.library.repository.ProfileRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
  private final ProfileRepository profileRepository;

  public StudentService(ProfileRepository profileRepository) {
    this.profileRepository = profileRepository;
  }

  public List<ProfileResponse> listStudents() {
    return profileRepository.findByRole(UserRole.STUDENT).stream()
        .map(com.library.mapper.ApiMapper::toProfileResponse)
        .toList();
  }
}
