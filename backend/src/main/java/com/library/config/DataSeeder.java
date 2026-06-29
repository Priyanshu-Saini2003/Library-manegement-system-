package com.library.config;

import com.library.model.Book;
import com.library.model.Notification;
import com.library.model.NotificationType;
import com.library.model.Profile;
import com.library.model.UserRole;
import com.library.repository.BookRepository;
import com.library.repository.NotificationRepository;
import com.library.repository.ProfileRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
  @Bean
  CommandLineRunner seedData(
      BookRepository bookRepository,
      ProfileRepository profileRepository,
      NotificationRepository notificationRepository,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      if (profileRepository.count() == 0) {
        Profile student = new Profile();
        student.setFullName("Alex Johnson");
        student.setEmail("alex@university.edu");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setRole(UserRole.STUDENT);
        student.setStudentId("STU-2024-001");

        Profile librarian = new Profile();
        librarian.setFullName("Dr. Sarah Mitchell");
        librarian.setEmail("librarian@university.edu");
        librarian.setPasswordHash(passwordEncoder.encode("password123"));
        librarian.setRole(UserRole.LIBRARIAN);

        profileRepository.saveAll(List.of(student, librarian));
      }

      if (bookRepository.count() == 0) {
        bookRepository.saveAll(List.of(
            book("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565", "Fiction", "A story of wealth, love, and the American Dream in the 1920s.", 5, 3, 1925, "Scribner", 95),
            book("A Brief History of Time", "Stephen Hawking", "978-0553380163", "Science", "An exploration of cosmology and the nature of the universe.", 4, 4, 1988, "Bantam Books", 88),
            book("Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "978-0062316097", "History", "A sweeping narrative of human history from the Stone Age to the twenty-first century.", 6, 2, 2011, "Harper", 97),
            book("Clean Code", "Robert C. Martin", "978-0132350884", "Technology", "A handbook of agile software craftsmanship and best practices.", 3, 1, 2008, "Prentice Hall", 92),
            book("Artificial Intelligence: A Modern Approach", "Stuart Russell", "978-0136042594", "Technology", "The definitive textbook on artificial intelligence, covering theory and practice.", 5, 3, 2020, "Pearson", 89),
            book("1984", "George Orwell", "978-0451524935", "Fiction", "A dystopian novel about totalitarianism, surveillance, and thought control.", 6, 5, 1949, "Secker & Warburg", 94)
        ));
      }

      if (notificationRepository.count() == 0) {
        Notification overdue = new Notification();
        overdue.setMessage("Book return reminder: check overdue items.");
        overdue.setType(NotificationType.WARNING);

        Notification added = new Notification();
        added.setMessage("New books have been added to the catalog.");
        added.setType(NotificationType.INFO);
        added.setRead(true);

        notificationRepository.saveAll(List.of(overdue, added));
      }
    };
  }

  private Book book(
      String title,
      String author,
      String isbn,
      String category,
      String description,
      int totalCopies,
      int availableCopies,
      int publishedYear,
      String publisher,
      int popularityScore
  ) {
    Book book = new Book();
    book.setTitle(title);
    book.setAuthor(author);
    book.setIsbn(isbn);
    book.setCategory(category);
    book.setDescription(description);
    book.setCoverUrl("/covers/default.svg");
    book.setTotalCopies(totalCopies);
    book.setAvailableCopies(availableCopies);
    book.setPublishedYear(publishedYear);
    book.setPublisher(publisher);
    book.setPopularityScore(popularityScore);
    return book;
  }
}
