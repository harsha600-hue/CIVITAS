package com.civitas.service;
import com.civitas.model.Event;
import com.civitas.repo.EventRepository;
import com.civitas.web.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AdminEventService {
  private final EventRepository events;
  public AdminEventService(EventRepository e) { events = e; }
  private void apply(Event e, Dtos.EventReq r, int sold) {
    if (r.totalTickets() < sold)
      throw new ApiException(HttpStatus.BAD_REQUEST, "Capacity cannot be below the " + sold + " tickets already sold.");
    e.setTitle(r.title()); e.setDescription(r.description()); e.setCategory(r.category()); e.setVenue(r.venue());
    e.setCity(r.city()); e.setEventDate(r.eventDate()); e.setTicketPrice(r.ticketPrice());
    e.setPosterUrl(r.posterUrl() == null || r.posterUrl().isBlank() ? null : r.posterUrl().trim());
    e.setTotalTickets(r.totalTickets()); e.setAvailableTickets(r.totalTickets() - sold);
  }
  private Event owned(Long id, Long organizerId) { // admins can only touch their own events
    Event e = events.findByIdForUpdate(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
    if (!organizerId.equals(e.getOrganizerId())) throw new ApiException(HttpStatus.NOT_FOUND, "Event not found");
    return e;
  }
  @Transactional public Event create(Dtos.EventReq r, Long organizerId) { Event e = new Event(); e.setOrganizerId(organizerId); apply(e, r, 0); return events.save(e); }
  @Transactional public Event update(Long id, Dtos.EventReq r, Long organizerId) {
    Event e = owned(id, organizerId); apply(e, r, e.getTotalTickets() - e.getAvailableTickets()); return e;
  }
  @Transactional public void cancel(Long id, Long organizerId) { owned(id, organizerId).setStatus(Event.Status.CANCELLED); }
}
