package com.library.repository;

import com.library.model.BookIssue;
import com.library.model.IssueStatus;
import com.library.model.Profile;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {
  List<BookIssue> findByStudentOrderByCreatedAtDesc(Profile student);

  long countByStatus(IssueStatus status);

  long countByStatusNot(IssueStatus status);

  long countByIssueDateBetween(LocalDate start, LocalDate end);
}
