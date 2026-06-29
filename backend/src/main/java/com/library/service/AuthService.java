package com.library.service;

import static com.library.mapper.ApiMapper.toProfileResponse;

import com.library.dto.Dtos.AuthResponse;
import com.library.dto.Dtos.LoginRequest;
import com.library.dto.Dtos.ProfileResponse;
import com.library.dto.Dtos.RegisterRequest;
import com.library.exception.ApiException;
import com.library.model.Profile;
import com.library.model.UserRole;
import com.library.repository.ProfileRepository;
import com.library.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final ProfileRepository profileRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final CurrentUserService currentUserService;

  public AuthService(
      ProfileRepository profileRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      CurrentUserService currentUserService
  ) {
    this.profileRepository = profileRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.currentUserService = currentUserService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (profileRepository.existsByEmailIgnoreCase(request.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
    }

    Profile profile = new Profile();
    profile.setFullName(request.fullName());
    profile.setEmail(request.email().trim().toLowerCase());
    profile.setPasswordHash(passwordEncoder.encode(request.password()));
    profile.setRole(request.role() == null ? UserRole.STUDENT : request.role());
    profile.setStudentId(request.studentId());

    Profile saved = profileRepository.save(profile);
    return new AuthResponse(jwtService.generateToken(saved), toProfileResponse(saved));
  }

  public AuthResponse login(LoginRequest request) {
    Profile profile = profileRepository.findByEmailIgnoreCase(request.email())
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), profile.getPasswordHash())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    return new AuthResponse(jwtService.generateToken(profile), toProfileResponse(profile));
  }

  public ProfileResponse me() {
    return toProfileResponse(currentUserService.requireCurrentUser());
  }
}
