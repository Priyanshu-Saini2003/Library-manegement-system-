package com.library.repository;

import com.library.model.Notification;
import com.library.model.Profile;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByProfileIsNullOrProfileOrderByCreatedAtDesc(Profile profile);

  boolean existsByProfileAndMessage(Profile profile, String message);
}
