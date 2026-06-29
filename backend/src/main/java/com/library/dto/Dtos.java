package com.library.dto;

import com.library.model.IssueStatus;
import com.library.model.NotificationType;
import com.library.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class Dtos {
  private Dtos() {
  }

  public record RegisterRequest(
      @NotBlank String fullName,
      @Email @NotBlank String email,
      @NotBlank String password,
      @NotNull UserRole role,
      String studentId
  ) {
  }

  public record LoginRequest(
      @Email @NotBlank String email,
      @NotBlank String password
  ) {
  }

  public record AuthResponse(
      String token,
      ProfileResponse profile
  ) {
  }

  public record ProfileResponse(
      String id,
      String fullName,
      String email,
      UserRole role,
      String studentId,
      String avatarUrl,
      Instant createdAt,
      Instant updatedAt
  ) {
  }

  public record BookRequest(
      @NotBlank String title,
      @NotBlank String author,
      String isbn,
      String category,
      String description,
      String coverUrl,
      @Min(1) int totalCopies,
      Integer availableCopies,
      Integer publishedYear,
      String publisher,
      Integer popularityScore
  ) {
  }

  public record BookResponse(
      String id,
      String title,
      String author,
      String isbn,
      String category,
      String description,
      String coverUrl,
      int totalCopies,
      int availableCopies,
      Integer publishedYear,
      String publisher,
      int popularityScore,
      Instant createdAt,
      Instant updatedAt
  ) {
  }

  public record IssueRequest(
      @NotNull Long bookId,
      Long studentId,
      LocalDate issueDate,
      String notes
  ) {
  }

  public record ReturnRequest(
      LocalDate returnDate,
      String notes
  ) {
  }

  public record BookIssueResponse(
      String id,
      String bookId,
      String studentId,
      String issuedBy,
      LocalDate issueDate,
      LocalDate dueDate,
      LocalDate returnDate,
      IssueStatus status,
      String notes,
      Instant createdAt,
      Instant updatedAt,
      BookResponse book,
      ProfileResponse student
  ) {
  }

  public record RecommendationResponse(
      BookResponse book,
      String reason,
      int confidence
  ) {
  }

  public record NotificationResponse(
      String id,
      String message,
      NotificationType type,
      boolean read,
      Instant createdAt
  ) {
  }

  public record ReportSummaryResponse(
      long totalBooks,
      long availableBooks,
      long issuedCount,
      long overdueCount,
      long activeStudents,
      double popularityScore
  ) {
  }

  public record MonthlyIssueResponse(
      String month,
      long count
  ) {
  }

  public record CategoryStatResponse(
      String category,
      long issued,
      int percentage
  ) {
  }

  public record ReportsResponse(
      ReportSummaryResponse summary,
      List<MonthlyIssueResponse> monthlyIssues,
      List<CategoryStatResponse> categoryStats
  ) {
  }
}
