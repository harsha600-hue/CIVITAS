package com.civitas.web;
import com.civitas.model.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
public final class Dtos {
  private Dtos() {}
  public record RegisterReq(@NotBlank @Size(max = 100) String name, @NotBlank @Email String email,
                            @NotBlank @Size(min = 8, max = 72) String password, @NotBlank String confirmPassword,
                            @Pattern(regexp = "USER|ORGANIZER") String accountType) {}
  public record LoginReq(@NotBlank String email, @NotBlank String password) {}
  public record UserRes(Long id, String name, String email, String role) {
    public static UserRes of(User u) { return new UserRes(u.getId(), u.getName(), u.getEmail(), u.getRole().name()); }
  }
  public record BookReq(@NotNull Long eventId, @Min(1) int quantity) {}
  public record EventReq(@NotBlank String title, @NotBlank String description, @NotBlank String category,
                         @NotBlank String venue, @NotBlank String city, @NotNull LocalDateTime eventDate,
                         @NotNull @DecimalMin("0.00") BigDecimal ticketPrice, @Min(1) int totalTickets, String posterUrl) {}
  public record EventRes(Long id, String title, String description, String category, String venue, String city,
                         LocalDateTime eventDate, BigDecimal ticketPrice, int totalTickets, int availableTickets,
                         String posterUrl, String status) {
    public static EventRes of(Event e) {
      return new EventRes(e.getId(), e.getTitle(), e.getDescription(), e.getCategory(), e.getVenue(), e.getCity(),
          e.getEventDate(), e.getTicketPrice(), e.getTotalTickets(), e.getAvailableTickets(), e.getPosterUrl(), e.getStatus().name());
    }
  }
  public record BookingRes(Long id, String bookingReference, EventRes event, String userEmail, int quantity,
                           BigDecimal totalPrice, String status, Instant bookingDate) {
    public static BookingRes of(Booking b) {
      return new BookingRes(b.getId(), b.getBookingReference(), EventRes.of(b.getEvent()), b.getUser().getEmail(),
          b.getQuantity(), b.getTotalPrice(), b.getStatus().name(), b.getBookingDate());
    }
  }
}
