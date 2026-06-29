package com.library.repository;

import com.library.model.Book;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
  List<Book> findTop6ByOrderByPopularityScoreDesc();
}
