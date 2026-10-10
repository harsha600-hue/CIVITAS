package com.civitas;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.civitas.model.*;
import com.civitas.repo.*;
import com.civitas.service.BookingService;
import com.civitas.web.ApiException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.*;

class BookingServiceTest {
  EventRepository events = mock(EventRepository.class);
  BookingRepository bookings = mock(BookingRepository.class);
  UserRepository users = mock(UserRepository.class);
  BookingService service = new BookingService(events, bookings, users, 6);
  Event ev = new Event();

  @BeforeEach void setUp() {
    ev.setEventDate(LocalDateTime.now().plusDays(3)); ev.setTicketPrice(new BigDecimal("500.00")); ev.setAvailableTickets(5);
    when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(new User()));
    when(events.findByIdForUpdate(1L)).thenReturn(Optional.of(ev));
    when(bookings.save(any())).thenAnswer(i -> i.getArgument(0));
  }
  @Test void bookingComputesPriceAndReducesInventory() {
    Booking b = service.book("a@b.com", 1L, 2);
    assertEquals(new BigDecimal("1000.00"), b.getTotalPrice());
    assertEquals(3, ev.getAvailableTickets());
  }
  @Test void rejectsMoreThanAvailable() { assertThrows(ApiException.class, () -> service.book("a@b.com", 1L, 6)); }
  @Test void rejectsQuantityAboveMax() { assertThrows(ApiException.class, () -> service.book("a@b.com", 1L, 7)); }
  @Test void rejectsCancelledEvent() { ev.setStatus(Event.Status.CANCELLED); assertThrows(ApiException.class, () -> service.book("a@b.com", 1L, 1)); }
}
