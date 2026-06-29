package com.library.service;

import com.library.exception.ApiException;
import com.library.model.Profile;
import com.library.model.UserRole;
import com.library.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
  private final ProfileRepository profileRepository;

  public CurrentUserService(ProfileRepository profileRepository) {
    this.profileRepository = profileRepository;
  }

  public Profile requireCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    if (authentication.getDetails() instanceof Profile profile) {
      return profile;
    }

    return profileRepository.findByEmailIgnoreCase(authentication.getName())
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
  }

  public boolean isLibrarian(Profile profile) {
    return profile.getRole() == UserRole.LIBRARIAN;
  }
}
