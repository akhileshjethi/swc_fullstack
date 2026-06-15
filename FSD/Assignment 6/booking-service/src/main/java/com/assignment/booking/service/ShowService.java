package com.assignment.booking.service;

import com.assignment.booking.cache.CacheConstants;
import com.assignment.booking.client.CatalogServiceClient;
import com.assignment.booking.dto.ShowRequest;
import com.assignment.booking.dto.ShowResponse;
import com.assignment.booking.dto.ShowSeatResponse;
import com.assignment.booking.entity.SeatStatus;
import com.assignment.booking.entity.Show;
import com.assignment.booking.entity.ShowSeat;
import com.assignment.booking.entity.ShowStatus;
import com.assignment.booking.exception.CustomExceptions.InvalidBookingStateException;
import com.assignment.booking.exception.CustomExceptions.ResourceNotFoundException;
import com.assignment.booking.repository.ShowRepository;
import com.assignment.booking.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowService {

    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final CatalogServiceClient catalogServiceClient;

    @Transactional
    @CacheEvict(value = CacheConstants.SHOWS_CACHE, allEntries = true)
    public ShowResponse createShow(ShowRequest request) {
        log.info("Creating show for Movie: {}, Theatre: {}, Auditorium: {}. Evicting '{}' cache.",
                request.getMovieId(), request.getTheatreId(), request.getAuditoriumId(), CacheConstants.SHOWS_CACHE);

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new InvalidBookingStateException("End time must be after start time");
        }

        // Validate movie, theatre, and auditorium exist in Catalog Service (reactive block)
        Mono.zip(
                catalogServiceClient.getMovie(request.getMovieId()),
                catalogServiceClient.getTheatre(request.getTheatreId()),
                catalogServiceClient.getAuditorium(request.getAuditoriumId())
        ).block(); // block here to perform validation synchronously in this transactional boundary

        Show show = Show.builder()
                .movieId(request.getMovieId())
                .theatreId(request.getTheatreId())
                .auditoriumId(request.getAuditoriumId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .language(request.getLanguage())
                .status(ShowStatus.ACTIVE)
                .build();

        Show savedShow = showRepository.save(show);

        // Fetch seat layouts and construct seats inventory for this show
        catalogServiceClient.getAuditorium(request.getAuditoriumId())
                .map(auditorium -> auditorium.getSeats().stream()
                        .map(seat -> ShowSeat.builder()
                                .showId(savedShow.getId())
                                .seatNumber(seat.getSeatNumber())
                                .rowNumber(seat.getRowNumber())
                                .seatType(seat.getSeatType())
                                .status(SeatStatus.AVAILABLE)
                                .build())
                        .collect(Collectors.toList()))
                .doOnSuccess(seats -> {
                    if (!seats.isEmpty()) {
                        showSeatRepository.saveAll(seats);
                        log.info("Generated {} seats for Show ID: {}", seats.size(), savedShow.getId());
                    }
                })
                .block();

        return mapToShowResponse(savedShow);
    }

    @Cacheable(value = CacheConstants.SHOW_CACHE, key = "#id")
    public ShowResponse getShowById(Long id) {
        log.info("CACHE MISS - Fetching Show from DB for id: {}", id);
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show with ID " + id + " not found"));
        return mapToShowResponse(show);
    }

    public Page<ShowResponse> getAllShows(Pageable pageable) {
        // Paginated queries are not cached due to variable pagination parameters
        log.debug("Fetching paginated shows - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return showRepository.findAll(pageable).map(this::mapToShowResponse);
    }

    public List<ShowResponse> searchShows(String movieId, String theatreId, LocalDate date) {
        // Search queries with dynamic parameters are not cached
        log.info("Searching shows for Movie: {}, Theatre: {}, Date: {}", movieId, theatreId, date);
        return showRepository.searchShows(movieId, theatreId, date)
                .stream()
                .map(this::mapToShowResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = CacheConstants.SEAT_AVAILABILITY_CACHE, key = "#showId")
    public List<ShowSeatResponse> getShowSeats(Long showId) {
        log.info("CACHE MISS - Fetching Seat Availability from DB for Show ID: {}", showId);
        // Ensure show exists
        showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("Show with ID " + showId + " not found"));

        return showSeatRepository.findByShowId(showId).stream()
                .map(seat -> ShowSeatResponse.builder()
                        .seatNumber(seat.getSeatNumber())
                        .rowNumber(seat.getRowNumber())
                        .seatType(seat.getSeatType())
                        .status(seat.getStatus())
                        .lockExpiryTime(seat.getLockExpiryTime())
                        .build())
                .collect(Collectors.toList());
    }

    private ShowResponse mapToShowResponse(Show show) {
        return ShowResponse.builder()
                .id(show.getId())
                .movieId(show.getMovieId())
                .theatreId(show.getTheatreId())
                .auditoriumId(show.getAuditoriumId())
                .startTime(show.getStartTime())
                .endTime(show.getEndTime())
                .language(show.getLanguage())
                .status(show.getStatus())
                .build();
    }
}
