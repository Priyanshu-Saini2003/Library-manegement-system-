package com.library.service;

import static com.library.mapper.ApiMapper.toBookResponse;

import com.library.dto.Dtos.BookRequest;
import com.library.dto.Dtos.BookResponse;
import com.library.exception.ApiException;
import com.library.model.Book;
import com.library.model.Notification;
import com.library.model.NotificationType;
import com.library.repository.BookRepository;
import com.library.repository.NotificationRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {
  private final BookRepository bookRepository;
  private final NotificationRepository notificationRepository;

  public BookService(BookRepository bookRepository, NotificationRepository notificationRepository) {
    this.bookRepository = bookRepository;
    this.notificationRepository = notificationRepository;
  }

  public List<BookResponse> list(String search, String category, String availability, String sort) {
    return bookRepository.findAll().stream()
        .filter(book -> matchesSearch(book, search))
        .filter(book -> category == null || category.isBlank() || "All".equalsIgnoreCase(category)
            || book.getCategory().equalsIgnoreCase(category))
        .filter(book -> matchesAvailability(book, availability))
        .sorted(comparator(sort))
        .map(com.library.mapper.ApiMapper::toBookResponse)
        .toList();
  }

  public List<BookResponse> trending() {
    return bookRepository.findTop6ByOrderByPopularityScoreDesc().stream()
        .map(com.library.mapper.ApiMapper::toBookResponse)
        .toList();
  }

  public BookResponse get(Long id) {
    return toBookResponse(findBook(id));
  }

  @Transactional
  public BookResponse create(BookRequest request) {
    Book book = new Book();
    applyRequest(book, request, true);
    Book saved = bookRepository.save(book);
    createNewArrivalNotification(saved);
    return toBookResponse(saved);
  }

  @Transactional
  public BookResponse update(Long id, BookRequest request) {
    Book book = findBook(id);
    applyRequest(book, request, false);
    return toBookResponse(bookRepository.save(book));
  }

  @Transactional
  public void delete(Long id) {
    if (!bookRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Book not found");
    }
    bookRepository.deleteById(id);
  }

  public Book findBook(Long id) {
    return bookRepository.findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));
  }

  private void applyRequest(Book book, BookRequest request, boolean creating) {
    book.setTitle(request.title());
    book.setAuthor(request.author());
    book.setIsbn(blankToNull(request.isbn()));
    book.setCategory(blankToDefault(request.category(), "General"));
    book.setDescription(blankToDefault(request.description(), ""));
    book.setCoverUrl(blankToNull(request.coverUrl()));
    book.setTotalCopies(Math.max(1, request.totalCopies()));

    int available = request.availableCopies() == null
        ? (creating ? Math.max(1, request.totalCopies()) : book.getAvailableCopies())
        : request.availableCopies();
    book.setAvailableCopies(Math.max(0, Math.min(available, book.getTotalCopies())));

    book.setPublishedYear(request.publishedYear());
    book.setPublisher(blankToDefault(request.publisher(), ""));
    book.setPopularityScore(request.popularityScore() == null ? book.getPopularityScore() : request.popularityScore());
  }

  private boolean matchesSearch(Book book, String search) {
    if (search == null || search.isBlank()) {
      return true;
    }
    String q = search.toLowerCase(Locale.ROOT);
    return book.getTitle().toLowerCase(Locale.ROOT).contains(q)
        || book.getAuthor().toLowerCase(Locale.ROOT).contains(q)
        || (book.getIsbn() != null && book.getIsbn().toLowerCase(Locale.ROOT).contains(q));
  }

  private boolean matchesAvailability(Book book, String availability) {
    if (availability == null || availability.isBlank() || "all".equalsIgnoreCase(availability)) {
      return true;
    }
    if ("available".equalsIgnoreCase(availability)) {
      return book.getAvailableCopies() > 0;
    }
    if ("unavailable".equalsIgnoreCase(availability)) {
      return book.getAvailableCopies() == 0;
    }
    return true;
  }

  private Comparator<Book> comparator(String sort) {
    if ("title".equalsIgnoreCase(sort)) {
      return Comparator.comparing(Book::getTitle, String.CASE_INSENSITIVE_ORDER);
    }
    if ("author".equalsIgnoreCase(sort)) {
      return Comparator.comparing(Book::getAuthor, String.CASE_INSENSITIVE_ORDER);
    }
    if ("year".equalsIgnoreCase(sort)) {
      return Comparator.comparing((Book b) -> b.getPublishedYear() == null ? 0 : b.getPublishedYear()).reversed();
    }
    return Comparator.comparing(Book::getPopularityScore).reversed();
  }

  private String blankToDefault(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value;
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value;
  }

  private void createNewArrivalNotification(Book book) {
    Notification notification = new Notification();
    notification.setMessage("New arrival: " + book.getTitle() + " is now available in the library catalog.");
    notification.setType(NotificationType.INFO);
    notificationRepository.save(notification);
  }
}
