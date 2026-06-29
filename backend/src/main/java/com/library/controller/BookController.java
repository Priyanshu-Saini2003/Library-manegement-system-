package com.library.controller;

import com.library.dto.Dtos.BookRequest;
import com.library.dto.Dtos.BookResponse;
import com.library.service.BookService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/books")
public class BookController {
  private final BookService bookService;

  public BookController(BookService bookService) {
    this.bookService = bookService;
  }

  @GetMapping
  public List<BookResponse> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String availability,
      @RequestParam(required = false, defaultValue = "popular") String sort
  ) {
    return bookService.list(search, category, availability, sort);
  }

  @GetMapping("/trending")
  public List<BookResponse> trending() {
    return bookService.trending();
  }

  @GetMapping("/{id}")
  public BookResponse get(@PathVariable Long id) {
    return bookService.get(id);
  }

  @PostMapping
  @PreAuthorize("hasRole('LIBRARIAN')")
  public BookResponse create(@Valid @RequestBody BookRequest request) {
    return bookService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('LIBRARIAN')")
  public BookResponse update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
    return bookService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('LIBRARIAN')")
  public void delete(@PathVariable Long id) {
    bookService.delete(id);
  }
}
