package com.library.mapper;

import com.library.dto.Dtos.BookIssueResponse;
import com.library.dto.Dtos.BookResponse;
import com.library.dto.Dtos.NotificationResponse;
import com.library.dto.Dtos.ProfileResponse;
import com.library.model.Book;
import com.library.model.BookIssue;
import com.library.model.Notification;
import com.library.model.Profile;

public final class ApiMapper {
  private ApiMapper() {
  }

  public static ProfileResponse toProfileResponse(Profile profile) {
    if (profile == null) {
      return null;
    }
    return new ProfileResponse(
        String.valueOf(profile.getId()),
        profile.getFullName(),
        profile.getEmail(),
        profile.getRole(),
        profile.getStudentId(),
        profile.getAvatarUrl(),
        profile.getCreatedAt(),
        profile.getUpdatedAt()
    );
  }

  public static BookResponse toBookResponse(Book book) {
    if (book == null) {
      return null;
    }
    return new BookResponse(
        String.valueOf(book.getId()),
        book.getTitle(),
        book.getAuthor(),
        book.getIsbn(),
        book.getCategory(),
        book.getDescription(),
        book.getCoverUrl(),
        book.getTotalCopies(),
        book.getAvailableCopies(),
        book.getPublishedYear(),
        book.getPublisher(),
        book.getPopularityScore(),
        book.getCreatedAt(),
        book.getUpdatedAt()
    );
  }

  public static BookIssueResponse toBookIssueResponse(BookIssue issue) {
    if (issue == null) {
      return null;
    }
    return new BookIssueResponse(
        String.valueOf(issue.getId()),
        String.valueOf(issue.getBook().getId()),
        String.valueOf(issue.getStudent().getId()),
        issue.getIssuedBy() == null ? null : String.valueOf(issue.getIssuedBy().getId()),
        issue.getIssueDate(),
        issue.getDueDate(),
        issue.getReturnDate(),
        issue.getStatus(),
        issue.getNotes(),
        issue.getCreatedAt(),
        issue.getUpdatedAt(),
        toBookResponse(issue.getBook()),
        toProfileResponse(issue.getStudent())
    );
  }

  public static NotificationResponse toNotificationResponse(Notification notification) {
    if (notification == null) {
      return null;
    }
    return new NotificationResponse(
        String.valueOf(notification.getId()),
        notification.getMessage(),
        notification.getType(),
        notification.isRead(),
        notification.getCreatedAt()
    );
  }
}
