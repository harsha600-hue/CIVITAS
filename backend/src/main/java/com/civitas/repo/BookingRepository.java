package com.civitas.repo;
import com.civitas.model.Booking;
import java.util.List;
import org.springframework.data.jpa.repository.*;
public interface BookingRepository extends JpaRepository<Booking, Long> {
  @Query("select b from Booking b join fetch b.event join fetch b.user where b.user.email = ?1 order by b.bookingDate desc")
  List<Booking> findByUserEmail(String email);
  @Query("select b from Booking b join fetch b.event e join fetch b.user where e.organizerId = ?1 order by b.bookingDate desc")
  List<Booking> findByOrganizer(Long organizerId);
  @Query("select b from Booking b join fetch b.event join fetch b.user order by b.bookingDate desc")
  List<Booking> findAllWithDetails();
}
