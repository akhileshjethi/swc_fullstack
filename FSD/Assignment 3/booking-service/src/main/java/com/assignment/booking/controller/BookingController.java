package com.assignment.booking.controller;

import com.assignment.booking.client.MovieClient;
import com.assignment.booking.dto.BookingRequest;
import com.assignment.booking.dto.BookingResponse;
import com.assignment.booking.dto.MovieDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final MovieClient movieClient;

    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest bookingRequest,
            @RequestHeader(value = "X-User-Email", required = false, defaultValue = "anonymous@test.com") String email,
            @RequestHeader(value = "X-User-Role", required = false, defaultValue = "ROLE_USER") String role) {

        log.info("Received booking request from user: {} with role: {}", email, role);

        // Inter-service call to Movie Service
        MovieDto movie = movieClient.getMovieDetails(bookingRequest.getMovieId());

        double totalAmount = movie.getPrice() * bookingRequest.getSeats();

        BookingResponse response = BookingResponse.builder()
                .bookingId(UUID.randomUUID().toString())
                .movieTitle(movie.getTitle())
                .totalAmount(totalAmount)
                .userEmail(email)
                .userRole(role)
                .status("SUCCESS")
                .build();

        return ResponseEntity.ok(response);
    }
}
