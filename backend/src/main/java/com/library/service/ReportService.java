package com.library.service;

import com.library.dto.Dtos.CategoryStatResponse;
import com.library.dto.Dtos.MonthlyIssueResponse;
import com.library.dto.Dtos.ReportSummaryResponse;
import com.library.dto.Dtos.ReportsResponse;
import com.library.model.Book;
import com.library.model.BookIssue;
import com.library.model.IssueStatus;
import com.library.model.UserRole;
import com.library.repository.BookIssueRepository;
import com.library.repository.BookRepository;
import com.library.repository.ProfileRepository;
import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportService {
  private final BookRepository bookRepository;
  private final BookIssueRepository issueRepository;
  private final ProfileRepository profileRepository;

  public ReportService(
      BookRepository bookRepository,
      BookIssueRepository issueRepository,
      ProfileRepository profileRepository
  ) {
    this.bookRepository = bookRepository;
    this.issueRepository = issueRepository;
    this.profileRepository = profileRepository;
  }

  public ReportsResponse reports() {
    return new ReportsResponse(summary(), monthlyIssues(), categoryStats());
  }

  public ReportSummaryResponse summary() {
    List<Book> books = bookRepository.findAll();
    List<BookIssue> issues = issueRepository.findAll();
    LocalDate today = LocalDate.now();
    long availableBooks = books.stream().filter(book -> book.getAvailableCopies() > 0).count();
    double popularity = books.stream().mapToInt(Book::getPopularityScore).average().orElse(0);
    long issuedCount = issues.stream()
        .filter(issue -> issue.getStatus() != IssueStatus.RETURNED)
        .count();
    long overdueCount = issues.stream()
        .filter(issue -> issue.getStatus() != IssueStatus.RETURNED)
        .filter(issue -> issue.getDueDate().isBefore(today) || issue.getStatus() == IssueStatus.OVERDUE)
        .count();

    return new ReportSummaryResponse(
        books.size(),
        availableBooks,
        issuedCount,
        overdueCount,
        profileRepository.findByRole(UserRole.STUDENT).size(),
        Math.round(popularity * 10.0) / 10.0
    );
  }

  public List<MonthlyIssueResponse> monthlyIssues() {
    int year = Year.now().getValue();
    return java.util.Arrays.stream(Month.values())
        .map(month -> {
          var start = java.time.LocalDate.of(year, month, 1);
          var end = start.withDayOfMonth(start.lengthOfMonth());
          return new MonthlyIssueResponse(month.name().substring(0, 3), issueRepository.countByIssueDateBetween(start, end));
        })
        .toList();
  }

  public List<CategoryStatResponse> categoryStats() {
    List<BookIssue> issues = issueRepository.findAll();
    Map<String, Long> counts = issues.stream()
        .collect(Collectors.groupingBy(issue -> issue.getBook().getCategory(), Collectors.counting()));
    long total = Math.max(1, issues.size());

    if (counts.isEmpty()) {
      List<Book> books = bookRepository.findAll();
      counts = books.stream()
          .collect(Collectors.groupingBy(Book::getCategory, Collectors.counting()));
      total = Math.max(1, books.size());
    }

    long totalRecords = total;
    return counts.entrySet().stream()
        .map(entry -> new CategoryStatResponse(
            entry.getKey(),
            entry.getValue(),
            (int) Math.round((entry.getValue() * 100.0) / totalRecords)
        ))
        .sorted((a, b) -> Long.compare(b.issued(), a.issued()))
        .toList();
  }
}
