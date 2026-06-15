package com.assignment.booking.repository;

import com.assignment.booking.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    @Query("SELECT s FROM Show s WHERE " +
            "(:movieId IS NULL OR s.movieId = :movieId) AND " +
            "(:theatreId IS NULL OR s.theatreId = :theatreId) AND " +
            "(:date IS NULL OR CAST(s.startTime AS date) = :date)")
    List<Show> searchShows(@Param("movieId") String movieId,
                           @Param("theatreId") String theatreId,
                           @Param("date") LocalDate date);
}
