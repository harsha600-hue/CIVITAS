package com.civitas.repo;
import com.civitas.model.Event;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface EventRepository extends JpaRepository<Event, Long> {
  java.util.List<Event> findByOrganizerIdOrderByEventDate(Long organizerId);
  @Query("""
    select e from Event e where e.status = :status and e.eventDate >= :from and e.ticketPrice <= :maxPrice
      and (:category = '' or e.category = :category)
      and (lower(e.title) like :q or lower(e.venue) like :q)""")
  Page<Event> search(@Param("q") String q, @Param("category") String category, @Param("from") LocalDateTime from,
                     @Param("maxPrice") BigDecimal maxPrice, @Param("status") Event.Status status, Pageable p);

  /** Row lock (SELECT ... FOR UPDATE): concurrent bookings queue up here, so no overselling. */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select e from Event e where e.id = :id")
  Optional<Event> findByIdForUpdate(@Param("id") Long id);
}
