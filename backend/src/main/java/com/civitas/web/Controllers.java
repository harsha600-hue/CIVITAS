package com.civitas.web;
import com.civitas.model.*;
import com.civitas.repo.*;
import com.civitas.service.*;
import com.civitas.web.Dtos.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
class AuthController {
  private final UserRepository users; private final PasswordEncoder enc; private final AuthenticationManager am;
  AuthController(UserRepository u, PasswordEncoder e, AuthenticationManager a) { users = u; enc = e; am = a; }

  @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
  UserRes register(@Valid @RequestBody RegisterReq r) {
    if (!r.password().equals(r.confirmPassword())) throw new ApiException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
    if (users.findByEmailIgnoreCase(r.email()).isPresent()) throw new ApiException(HttpStatus.CONFLICT, "That email is already registered.");
    User u = new User(); u.setName(r.name()); u.setEmail(r.email().toLowerCase()); u.setPasswordHash(enc.encode(r.password()));
    // Attendee or organiser only. There is no way to request any other role.
    u.setRole("ORGANIZER".equals(r.accountType()) ? User.Role.ORGANIZER : User.Role.USER);
    return UserRes.of(users.save(u));
  }
  @PostMapping("/login")
  UserRes login(@Valid @RequestBody LoginReq r, HttpServletRequest req, HttpServletResponse res) {
    try {
      var auth = am.authenticate(new UsernamePasswordAuthenticationToken(r.email(), r.password()));
      var ctx = SecurityContextHolder.createEmptyContext(); ctx.setAuthentication(auth);
      new HttpSessionSecurityContextRepository().saveContext(ctx, req, res);
      return UserRes.of(users.findByEmailIgnoreCase(r.email()).orElseThrow());
    } catch (AuthenticationException ex) { throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password."); }
  }
  @GetMapping("/me") UserRes me(Principal p) { return UserRes.of(users.findByEmailIgnoreCase(p.getName()).orElseThrow()); }
}

@RestController @RequestMapping("/api/events")
class EventController {
  private final EventRepository events;
  EventController(EventRepository e) { events = e; }
  @GetMapping Page<EventRes> list(@RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "") String category,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
      @RequestParam(defaultValue = "100000") BigDecimal maxPrice, @RequestParam(defaultValue = "eventDate") String sort,
      @RequestParam(defaultValue = "asc") String dir, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "9") int size) {
    String col = sort.equals("ticketPrice") ? "ticketPrice" : "eventDate"; // whitelist sortable fields
    Sort s = Sort.by(dir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, col);
    return events.search("%" + q.toLowerCase() + "%", category, from != null ? from : LocalDateTime.now(), maxPrice,
        Event.Status.ACTIVE, PageRequest.of(Math.max(page, 0), Math.min(size, 50), s)).map(EventRes::of);
  }
  @GetMapping("/{id}") EventRes get(@PathVariable Long id) {
    return EventRes.of(events.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found")));
  }
}

@RestController @RequestMapping("/api/bookings")
class BookingController {
  private final BookingService service; private final BookingRepository bookings;
  BookingController(BookingService s, BookingRepository b) { service = s; bookings = b; }
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  BookingRes create(@Valid @RequestBody BookReq r, Principal p) { return BookingRes.of(service.book(p.getName(), r.eventId(), r.quantity())); }
  @GetMapping("/mine") List<BookingRes> mine(Principal p) { return bookings.findByUserEmail(p.getName()).stream().map(BookingRes::of).toList(); }
  @PostMapping("/{id}/cancel") BookingRes cancel(@PathVariable Long id, Principal p) { return BookingRes.of(service.cancel(p.getName(), id)); }
}

@RestController @RequestMapping("/api/organizer")
class AdminController {
  private final AdminEventService svc; private final BookingRepository bookings; private final EventRepository events; private final UserRepository users;
  AdminController(AdminEventService s, BookingRepository b, EventRepository e, UserRepository u) { svc = s; bookings = b; events = e; users = u; }
  private Long me(Principal p) { return users.findByEmailIgnoreCase(p.getName()).orElseThrow().getId(); }
  @GetMapping("/events") List<EventRes> mine(Principal p) { return events.findByOrganizerIdOrderByEventDate(me(p)).stream().map(EventRes::of).toList(); }
  @PostMapping("/events") @ResponseStatus(HttpStatus.CREATED) EventRes create(@Valid @RequestBody EventReq r, Principal p) { return EventRes.of(svc.create(r, me(p))); }
  @PutMapping("/events/{id}") EventRes update(@PathVariable Long id, @Valid @RequestBody EventReq r, Principal p) { return EventRes.of(svc.update(id, r, me(p))); }
  @PostMapping("/events/{id}/cancel") @ResponseStatus(HttpStatus.NO_CONTENT) void cancel(@PathVariable Long id, Principal p) { svc.cancel(id, me(p)); }
  @GetMapping("/bookings") List<BookingRes> all(Principal p) { return bookings.findByOrganizer(me(p)).stream().map(BookingRes::of).toList(); }
}

@RestControllerAdvice
class ApiExceptionHandler {
  record Err(int status, String message) {}
  @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class) ResponseEntity<Err> tooBig(Exception e) {
    return ResponseEntity.status(413).body(new Err(413, "Image must be 5 MB or smaller."));
  }
  @ExceptionHandler(ApiException.class) ResponseEntity<Err> api(ApiException e) { return ResponseEntity.status(e.status).body(new Err(e.status.value(), e.getMessage())); }
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Err> invalid(MethodArgumentNotValidException e) {
    String m = e.getBindingResult().getFieldErrors().stream().map(f -> f.getField() + " " + f.getDefaultMessage()).findFirst().orElse("Invalid input");
    return ResponseEntity.badRequest().body(new Err(400, m));
  }
}
