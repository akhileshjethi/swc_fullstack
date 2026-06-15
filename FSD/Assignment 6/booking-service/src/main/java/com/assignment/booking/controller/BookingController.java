package com.assignment.booking.controller;

import com.assignment.booking.dto.BookingRequest;
import com.assignment.booking.dto.BookingResponse;
import com.assignment.booking.dto.LockSeatRequest;
import com.assignment.booking.response.ApiResponse;
import com.assignment.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<Void>> lockSeats(@Valid @RequestBody LockSeatRequest request, Principal principal) {
        bookingService.lockSeats(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Seats locked temporarily for 5 minutes", null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request, Principal principal) {
        BookingResponse booking = bookingService.createBooking(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking initiated successfully", booking));
    }

    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(@PathVariable Long bookingId) {
        BookingResponse booking = bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed successfully", booking));
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            Principal principal,
            Authentication authentication) {
        
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        BookingResponse booking = bookingService.cancelBooking(bookingId, principal.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @bookingService.getBookingById(#id).userId == authentication.name")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUserBookings(Principal principal) {
        List<BookingResponse> bookings = bookingService.getUserBookings(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("User bookings history retrieved successfully", bookings));
    }
}
