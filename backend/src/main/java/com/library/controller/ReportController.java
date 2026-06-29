package com.library.controller;

import com.library.dto.Dtos.CategoryStatResponse;
import com.library.dto.Dtos.MonthlyIssueResponse;
import com.library.dto.Dtos.ReportSummaryResponse;
import com.library.dto.Dtos.ReportsResponse;
import com.library.service.ReportService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('LIBRARIAN')")
public class ReportController {
  private final ReportService reportService;

  public ReportController(ReportService reportService) {
    this.reportService = reportService;
  }

  @GetMapping
  public ReportsResponse reports() {
    return reportService.reports();
  }

  @GetMapping("/summary")
  public ReportSummaryResponse summary() {
    return reportService.summary();
  }

  @GetMapping("/monthly-issues")
  public List<MonthlyIssueResponse> monthlyIssues() {
    return reportService.monthlyIssues();
  }

  @GetMapping("/category-stats")
  public List<CategoryStatResponse> categoryStats() {
    return reportService.categoryStats();
  }
}
