package com.library.repository;

import com.library.model.Profile;
import com.library.model.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
  Optional<Profile> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  List<Profile> findByRole(UserRole role);
}
