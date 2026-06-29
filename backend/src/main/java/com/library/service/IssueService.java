package com.library.service;

import static com.library.mapper.ApiMapper.toBookIssueResponse;

import com.library.dto.Dtos.BookIssueResponse;
import com.library.dto.Dtos.IssueRequest;
import com.library.dto.Dtos.ReturnRequest;
import com.library.exception.ApiException;
import com.library.model.Book;
import com.library.model.BookIssue;
import com.library.model.IssueStatus;
import com.library.model.Notification;
import com.library.model.NotificationType;
import com.library.model.Profile;
import com.library.model.UserRole;
import com.library.repository.BookIssueRepository;
import com.library.repository.BookRepository;
import com.library.repository.NotificationRepository;
import com.library.repository.ProfileRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IssueService {
  private final BookIssueRepository issueRepository;
  private final BookRepository bookRepository;
  private final ProfileRepository profileRepository;
  private final NotificationRepository notificationRepository;
  private final CurrentUserService currentUserService;

  public IssueService(
      BookIssueRepository issueRepository,
      BookRepository bookRepository,
      ProfileRepository profileRepository,
      NotificationRepository notificationRepository,
      CurrentUserService currentUserService
  ) {
    this.issueRepository = issueRepository;
    this.bookRepository = bookRepository;
    this.profileRepository = profileRepository;
    this.notificationRepository = notificationRepository;
    this.currentUserService = currentUserService;
  }

  @Transactional
  public List<BookIssueResponse> listAll() {
    Profile current = currentUserService.requireCurrentUser();
    List<BookIssue> issues = currentUserService.isLibrarian(current)
        ? issueRepository.findAll()
        : issueRepository.findByStudentOrderByCreatedAtDesc(current);
    refreshOverdue(issues);
    return issues.stream().map(com.library.mapper.ApiMapper::toBookIssueResponse).toList();
  }

  @Transactional
  public List<BookIssueResponse> listMine() {
    Profile current = currentUserService.requireCurrentUser();
    List<BookIssue> issues = issueRepository.findByStudentOrderByCreatedAtDesc(current);
    refreshOverdue(issues);
    return issues.stream().map(com.library.mapper.ApiMapper::toBookIssueResponse).toList();
  }

  @Transactional
  public BookIssueResponse issueBook(IssueRequest request) {
    Profile current = currentUserService.requireCurrentUser();
    Book book = bookRepository.findById(request.bookId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

    if (book.getAvailableCopies() <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Book is not available");
    }

    Profile student = resolveStudent(current, request.studentId());
    LocalDate issueDate = request.issueDate() == null ? LocalDate.now() : request.issueDate();

    BookIssue issue = new BookIssue();
    issue.setBook(book);
    issue.setStudent(student);
    issue.setIssuedBy(currentUserService.isLibrarian(current) ? current : null);
    issue.setIssueDate(issueDate);
    issue.setDueDate(issueDate.plusDays(14));
    issue.setStatus(IssueStatus.ISSUED);
    issue.setNotes(request.notes() == null ? "" : request.notes());

    book.setAvailableCopies(book.getAvailableCopies() - 1);
    bookRepository.save(book);

    BookIssue saved = issueRepository.save(issue);
    createNotificationIfMissing(
        student,
        "Book issued: " + book.getTitle() + ". Due date: " + saved.getDueDate() + ".",
        NotificationType.INFO
    );
    return toBookIssueResponse(saved);
  }

  @Transactional
  public BookIssueResponse returnBook(Long issueId, ReturnRequest request) {
    Profile current = currentUserService.requireCurrentUser();
    BookIssue issue = issueRepository.findById(issueId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue record not found"));

    if (!currentUserService.isLibrarian(current) && !issue.getStudent().getId().equals(current.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "You cannot return another student's issue record");
    }

    if (issue.getStatus() == IssueStatus.RETURNED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Book is already returned");
    }

    LocalDate returnDate = request.returnDate() == null ? LocalDate.now() : request.returnDate();
    issue.setReturnDate(returnDate);
    issue.setStatus(IssueStatus.RETURNED);
    issue.setNotes(request.notes() == null ? issue.getNotes() : request.notes());

    Book book = issue.getBook();
    book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
    bookRepository.save(book);

    BookIssue saved = issueRepository.save(issue);
    createNotificationIfMissing(
        issue.getStudent(),
        "Book returned: " + book.getTitle() + ". Thank you for returning it.",
        NotificationType.SUCCESS
    );
    return toBookIssueResponse(saved);
  }

  private Profile resolveStudent(Profile current, Long requestedStudentId) {
    if (current.getRole() == UserRole.STUDENT) {
      return current;
    }

    if (requestedStudentId == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "student_id is required for librarian issue");
    }

    Profile student = profileRepository.findById(requestedStudentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
    if (student.getRole() != UserRole.STUDENT) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Selected user is not a student");
    }
    return student;
  }

  private void refreshOverdue(List<BookIssue> issues) {
    LocalDate today = LocalDate.now();
    for (BookIssue issue : issues) {
      if (issue.getStatus() == IssueStatus.ISSUED && issue.getDueDate().isBefore(today)) {
        issue.setStatus(IssueStatus.OVERDUE);
        createNotificationIfMissing(
            issue.getStudent(),
            "Overdue alert: " + issue.getBook().getTitle() + " was due on " + issue.getDueDate() + ".",
            NotificationType.WARNING
        );
      } else if (issue.getStatus() == IssueStatus.ISSUED
          && !issue.getDueDate().isBefore(today)
          && !issue.getDueDate().isAfter(today.plusDays(2))) {
        createNotificationIfMissing(
            issue.getStudent(),
            "Due date reminder: " + issue.getBook().getTitle() + " is due on " + issue.getDueDate() + ".",
            NotificationType.WARNING
        );
      }
    }
  }

  private void createNotificationIfMissing(Profile profile, String message, NotificationType type) {
    if (notificationRepository.existsByProfileAndMessage(profile, message)) {
      return;
    }

    Notification notification = new Notification();
    notification.setProfile(profile);
    notification.setMessage(message);
    notification.setType(type);
    notificationRepository.save(notification);
  }
}
