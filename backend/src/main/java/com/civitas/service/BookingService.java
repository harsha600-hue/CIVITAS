package com.civitas.service;
import com.civitas.model.*;
import com.civitas.repo.*;
import com.civitas.web.ApiException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
  private final EventRepository events; private final BookingRepository bookings; private final UserRepository users;
  private final int maxPerBooking;
  public BookingService(EventRepository e, BookingRepository b, UserRepository u,
                        @Value("${civitas.max-tickets-per-booking}") int max) { events = e; bookings = b; users = u; maxPerBooking = max; }

  @Transactional
  public Booking book(String email, Long eventId, int qty) {
    if (qty < 1 || qty > maxPerBooking)
      throw new ApiException(HttpStatus.BAD_REQUEST, "You can book 1 to " + maxPerBooking + " tickets at a time.");
    User user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Unknown user"));
    if (user.getRole() == User.Role.ORGANIZER) throw new ApiException(HttpStatus.FORBIDDEN, "Organiser accounts cannot book tickets.");
    Event ev = events.findByIdForUpdate(eventId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
    if (ev.getStatus() == Event.Status.CANCELLED) throw new ApiException(HttpStatus.CONFLICT, "This event was cancelled.");
    if (!ev.getEventDate().isAfter(LocalDateTime.now())) throw new ApiException(HttpStatus.CONFLICT, "This event has already started.");
    if (ev.getAvailableTickets() < qty)
      throw new ApiException(HttpStatus.CONFLICT, "Only " + ev.getAvailableTickets() + " tickets left.");
    ev.setAvailableTickets(ev.getAvailableTickets() - qty);
    Booking b = new Booking();
    b.setUser(user); b.setEvent(ev); b.setQuantity(qty);
    b.setTotalPrice(ev.getTicketPrice().multiply(BigDecimal.valueOf(qty))); // price always computed server-side
    b.setBookingReference("CIV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    return bookings.save(b);
  }

  @Transactional
  public Booking cancel(String email, Long bookingId) {
    Booking b = bookings.findById(bookingId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
    if (!b.getUser().getEmail().equalsIgnoreCase(email)) throw new ApiException(HttpStatus.NOT_FOUND, "Booking not found");
    if (b.getStatus() == Booking.Status.CANCELLED) throw new ApiException(HttpStatus.CONFLICT, "Already cancelled.");
    Event ev = events.findByIdForUpdate(b.getEvent().getId()).orElseThrow();
    if (!ev.getEventDate().isAfter(LocalDateTime.now())) throw new ApiException(HttpStatus.CONFLICT, "Past events cannot be cancelled.");
    b.setStatus(Booking.Status.CANCELLED); // history is kept
    ev.setAvailableTickets(ev.getAvailableTickets() + b.getQuantity());
    return b;
  }
}
