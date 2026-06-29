package com.library.service;

import static com.library.mapper.ApiMapper.toBookResponse;

import com.library.dto.Dtos.RecommendationResponse;
import com.library.model.Book;
import com.library.model.BookIssue;
import com.library.model.IssueStatus;
import com.library.model.Profile;
import com.library.model.UserRole;
import com.library.repository.BookIssueRepository;
import com.library.repository.BookRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecommendationService {
  private final BookRepository bookRepository;
  private final BookIssueRepository issueRepository;
  private final CurrentUserService currentUserService;

  public RecommendationService(
      BookRepository bookRepository,
      BookIssueRepository issueRepository,
      CurrentUserService currentUserService
  ) {
    this.bookRepository = bookRepository;
    this.issueRepository = issueRepository;
    this.currentUserService = currentUserService;
  }

  @Transactional(readOnly = true)
  public List<RecommendationResponse> recommendations() {
    Profile current = currentUserService.requireCurrentUser();
    List<BookIssue> globalHistory = issueRepository.findAll();
    List<BookIssue> studentHistory = current.getRole() == UserRole.STUDENT
        ? issueRepository.findByStudentOrderByCreatedAtDesc(current)
        : List.of();

    RecommendationProfile profile = preprocess(studentHistory, globalHistory);

    return bookRepository.findAll().stream()
        .filter(book -> book.getAvailableCopies() > 0)
        .filter(book -> !profile.activeBookIds().contains(book.getId()))
        .map(book -> score(book, profile))
        .sorted(Comparator.comparing(ScoredRecommendation::confidence).reversed()
            .thenComparing(scored -> scored.book().getTitle(), String.CASE_INSENSITIVE_ORDER))
        .limit(6)
        .map(scored -> new RecommendationResponse(toBookResponse(scored.book()), scored.reason(), scored.confidence()))
        .toList();
  }

  private RecommendationProfile preprocess(List<BookIssue> studentHistory, List<BookIssue> globalHistory) {
    Map<String, Long> studentCategoryCounts = studentHistory.stream()
        .map(issue -> issue.getBook().getCategory())
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
    Map<String, Long> studentAuthorCounts = studentHistory.stream()
        .map(issue -> issue.getBook().getAuthor())
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
    Map<Long, Long> globalBookDemand = globalHistory.stream()
        .collect(Collectors.groupingBy(issue -> issue.getBook().getId(), Collectors.counting()));
    Map<String, Long> globalCategoryDemand = globalHistory.stream()
        .map(issue -> issue.getBook().getCategory())
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
    Set<Long> activeBookIds = studentHistory.stream()
        .filter(issue -> issue.getStatus() != IssueStatus.RETURNED)
        .map(issue -> issue.getBook().getId())
        .collect(Collectors.toSet());

    long maxStudentCategory = studentCategoryCounts.values().stream().mapToLong(Long::longValue).max().orElse(0);
    long maxStudentAuthor = studentAuthorCounts.values().stream().mapToLong(Long::longValue).max().orElse(0);
    long maxGlobalBookDemand = globalBookDemand.values().stream().mapToLong(Long::longValue).max().orElse(0);
    long maxGlobalCategoryDemand = globalCategoryDemand.values().stream().mapToLong(Long::longValue).max().orElse(0);

    return new RecommendationProfile(
        studentCategoryCounts,
        studentAuthorCounts,
        globalBookDemand,
        globalCategoryDemand,
        activeBookIds,
        maxStudentCategory,
        maxStudentAuthor,
        maxGlobalBookDemand,
        maxGlobalCategoryDemand,
        studentHistory.isEmpty()
    );
  }

  private ScoredRecommendation score(Book book, RecommendationProfile profile) {
    double popularityScore = normalize(book.getPopularityScore(), 100);
    double studentCategoryScore = normalize(profile.studentCategoryCounts().getOrDefault(book.getCategory(), 0L), profile.maxStudentCategory());
    double studentAuthorScore = normalize(profile.studentAuthorCounts().getOrDefault(book.getAuthor(), 0L), profile.maxStudentAuthor());
    double globalBookScore = normalize(profile.globalBookDemand().getOrDefault(book.getId(), 0L), profile.maxGlobalBookDemand());
    double globalCategoryScore = normalize(profile.globalCategoryDemand().getOrDefault(book.getCategory(), 0L), profile.maxGlobalCategoryDemand());
    double availabilityScore = normalize(book.getAvailableCopies(), Math.max(1, book.getTotalCopies()));

    double weightedScore = popularityScore * 38
        + studentCategoryScore * 25
        + studentAuthorScore * 8
        + globalBookScore * 14
        + globalCategoryScore * 8
        + availabilityScore * 7;

    int confidence = Math.min(99, Math.max(62, (int) Math.round(weightedScore)));
    return new ScoredRecommendation(book, confidence, reasonFor(book, profile));
  }

  private double normalize(long value, long max) {
    if (max <= 0) {
      return 0;
    }
    return Math.min(1, value / (double) max);
  }

  private String reasonFor(Book book, RecommendationProfile profile) {
    long categoryCount = profile.studentCategoryCounts().getOrDefault(book.getCategory(), 0L);
    if (categoryCount > 0) {
      return "Recommended because your borrowing history shows interest in " + book.getCategory() + " books";
    }
    long authorCount = profile.studentAuthorCounts().getOrDefault(book.getAuthor(), 0L);
    if (authorCount > 0) {
      return "Recommended because you have borrowed books by " + book.getAuthor();
    }
    long globalDemand = profile.globalBookDemand().getOrDefault(book.getId(), 0L);
    if (globalDemand > 0) {
      return "Recommended because this book is frequently borrowed by other students";
    }
    long categoryDemand = profile.globalCategoryDemand().getOrDefault(book.getCategory(), 0L);
    if (categoryDemand > 0) {
      return "Recommended from current " + book.getCategory() + " reading trends";
    }
    if (profile.newReader()) {
      return "Recommended as a popular starting point for new readers";
    }
    return "Recommended using popularity, availability, and catalog trend scoring";
  }

  private record RecommendationProfile(
      Map<String, Long> studentCategoryCounts,
      Map<String, Long> studentAuthorCounts,
      Map<Long, Long> globalBookDemand,
      Map<String, Long> globalCategoryDemand,
      Set<Long> activeBookIds,
      long maxStudentCategory,
      long maxStudentAuthor,
      long maxGlobalBookDemand,
      long maxGlobalCategoryDemand,
      boolean newReader
  ) {
  }

  private record ScoredRecommendation(Book book, int confidence, String reason) {
  }
}
