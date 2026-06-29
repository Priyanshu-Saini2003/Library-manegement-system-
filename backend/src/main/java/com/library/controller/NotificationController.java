package com.library.controller;

import com.library.dto.Dtos.NotificationResponse;
import com.library.service.NotificationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public List<NotificationResponse> list() {
    return notificationService.list();
  }

  @PutMapping("/read-all")
  public List<NotificationResponse> markAllRead() {
    return notificationService.markAllRead();
  }
}
