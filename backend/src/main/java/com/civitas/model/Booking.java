package com.civitas.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.*;
@Entity @Table(name = "bookings") @Getter @Setter
public class Booking {
  public enum Status { CONFIRMED, CANCELLED }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private String bookingReference;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private User user;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Event event;
  private int quantity;
  private BigDecimal totalPrice; // frozen at booking time
  @Enumerated(EnumType.STRING) private Status status = Status.CONFIRMED;
  private Instant bookingDate = Instant.now();
}
