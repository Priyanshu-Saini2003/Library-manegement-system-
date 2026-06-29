package com.library.service;

import static com.library.mapper.ApiMapper.toNotificationResponse;

import com.library.dto.Dtos.NotificationResponse;
import com.library.model.Notification;
import com.library.model.Profile;
import com.library.repository.NotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final CurrentUserService currentUserService;

  public NotificationService(NotificationRepository notificationRepository, CurrentUserService currentUserService) {
    this.notificationRepository = notificationRepository;
    this.currentUserService = currentUserService;
  }

  public List<NotificationResponse> list() {
    Profile current = currentUserService.requireCurrentUser();
    return notificationRepository.findByProfileIsNullOrProfileOrderByCreatedAtDesc(current).stream()
        .map(com.library.mapper.ApiMapper::toNotificationResponse)
        .toList();
  }

  @Transactional
  public List<NotificationResponse> markAllRead() {
    Profile current = currentUserService.requireCurrentUser();
    List<Notification> notifications = notificationRepository.findByProfileIsNullOrProfileOrderByCreatedAtDesc(current);
    notifications.forEach(notification -> notification.setRead(true));
    return notificationRepository.saveAll(notifications).stream()
        .map(com.library.mapper.ApiMapper::toNotificationResponse)
        .toList();
  }
}
