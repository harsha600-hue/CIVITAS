package com.civitas.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import lombok.*;
@Entity @Table(name = "events") @Getter @Setter
public class Event {
  public enum Status { ACTIVE, CANCELLED }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private String title;
  @Column(columnDefinition = "TEXT") private String description;
  private String category, venue, city, posterUrl;
  private LocalDateTime eventDate;
  private Long organizerId; // the admin who created the event
  private BigDecimal ticketPrice;
  private int totalTickets, availableTickets;
  @Enumerated(EnumType.STRING) private Status status = Status.ACTIVE;
  private Instant createdAt = Instant.now();
}
