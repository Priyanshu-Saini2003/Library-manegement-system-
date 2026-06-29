package com.library.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jdk.jfr.DataAmount;
import lombok.Data;

import java.time.Instant;
@Data
@Entity
@Table(name = "books")
public class Book {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String author;

  @Column(unique = true)
  private String isbn;

  @Column(nullable = false)
  private String category = "General";

  @Column(columnDefinition = "TEXT")
  private String description = "";

  @Column(name = "cover_url", columnDefinition = "TEXT")
  private String coverUrl;

  @Column(name = "total_copies", nullable = false)
  private int totalCopies = 1;

  @Column(name = "available_copies", nullable = false)
  private int availableCopies = 1;

  @Column(name = "published_year")
  private Integer publishedYear;

  private String publisher = "";

  @Column(name = "popularity_score")
  private int popularityScore = 0;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    Instant now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }
}
