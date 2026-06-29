package com.library.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum IssueStatus {
  ISSUED("issued"),
  RETURNED("returned"),
  OVERDUE("overdue");

  private final String value;

  IssueStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static IssueStatus fromValue(String value) {
    for (IssueStatus status : values()) {
      if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown issue status: " + value);
  }
}
