package com.library.controller;

import com.library.dto.Dtos.BookIssueResponse;
import com.library.dto.Dtos.IssueRequest;
import com.library.dto.Dtos.ReturnRequest;
import com.library.service.IssueService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/issues")
public class IssueController {
  private final IssueService issueService;

  public IssueController(IssueService issueService) {
    this.issueService = issueService;
  }

  @GetMapping
  public List<BookIssueResponse> list() {
    return issueService.listAll();
  }

  @GetMapping("/my")
  public List<BookIssueResponse> listMine() {
    return issueService.listMine();
  }

  @PostMapping
  public BookIssueResponse issueBook(@Valid @RequestBody IssueRequest request) {
    return issueService.issueBook(request);
  }

  @PutMapping("/{id}/return")
  public BookIssueResponse returnBook(@PathVariable Long id, @RequestBody ReturnRequest request) {
    return issueService.returnBook(id, request);
  }
}
