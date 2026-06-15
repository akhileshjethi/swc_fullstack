package com.assignment.booking.repository;

import com.assignment.booking.entity.SeatStatus;
import com.assignment.booking.entity.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    List<ShowSeat> findByShowId(Long showId);

    List<ShowSeat> findByShowIdAndSeatNumberIn(Long showId, List<String> seatNumbers);

    @Query("SELECT s FROM ShowSeat s WHERE s.status = :status AND s.lockExpiryTime < :now")
    List<ShowSeat> findExpiredLocks(@Param("status") SeatStatus status, @Param("now") LocalDateTime now);
}
