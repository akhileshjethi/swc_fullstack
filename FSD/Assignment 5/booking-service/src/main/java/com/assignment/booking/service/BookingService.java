package com.assignment.booking.service;

import com.assignment.booking.dto.BookingRequest;
import com.assignment.booking.dto.BookingResponse;
import com.assignment.booking.dto.LockSeatRequest;
import com.assignment.booking.entity.*;
import com.assignment.booking.exception.CustomExceptions.*;
import com.assignment.booking.repository.BookingRepository;
import com.assignment.booking.repository.ShowRepository;
import com.assignment.booking.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;

    private static final double DEFAULT_SEAT_PRICE = 150.0;
    private static final long LOCK_DURATION_MINUTES = 5;

    @Transactional
    public void lockSeats(LockSeatRequest request, String userId) {
        log.info("User {} attempting to lock seats {} for Show ID: {}", userId, request.getSeatNumbers(), request.getShowId());

        showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show with ID " + request.getShowId() + " not found"));

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatNumberIn(request.getShowId(), request.getSeatNumbers());

        if (showSeats.size() != request.getSeatNumbers().size()) {
            throw new ResourceNotFoundException("One or more selected seats were not found for this show");
        }

        LocalDateTime now = LocalDateTime.now();

        for (ShowSeat seat : showSeats) {
            // Check if already booked or currently locked (not expired)
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is already booked");
            }
            if (seat.getStatus() == SeatStatus.LOCKED && seat.getLockExpiryTime() != null && seat.getLockExpiryTime().isAfter(now)) {
                // If it is locked by someone else, fail. If it is already locked by the current user, we can refresh the lock.
                if (!userId.equals(seat.getLockedBy())) {
                    throw new SeatAlreadyLockedException("Seat " + seat.getSeatNumber() + " is currently locked by another user");
                }
            }

            // Lock the seat
            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockExpiryTime(now.plusMinutes(LOCK_DURATION_MINUTES));
            seat.setLockedBy(userId);
        }

        showSeatRepository.saveAll(showSeats);
        log.info("Successfully locked {} seats for user {} on Show ID: {}", showSeats.size(), userId, request.getShowId());
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userId) {
        log.info("User {} attempting to create booking for seats {} on Show ID: {}", userId, request.getSeatNumbers(), request.getShowId());

        showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show with ID " + request.getShowId() + " not found"));

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatNumberIn(request.getShowId(), request.getSeatNumbers());

        if (showSeats.size() != request.getSeatNumbers().size()) {
            throw new ResourceNotFoundException("One or more selected seats were not found for this show");
        }

        LocalDateTime now = LocalDateTime.now();

        // Validate seats are locked by current user and locks are not expired
        for (ShowSeat seat : showSeats) {
            if (seat.getStatus() != SeatStatus.LOCKED || !userId.equals(seat.getLockedBy())) {
                throw new InvalidBookingStateException("Seat " + seat.getSeatNumber() + " must be locked before creating a booking");
            }
            if (seat.getLockExpiryTime() == null || seat.getLockExpiryTime().isBefore(now)) {
                throw new InvalidBookingStateException("Lock expired for seat " + seat.getSeatNumber() + ". Please lock again.");
            }
        }

        // Generate Booking
        double totalAmount = showSeats.size() * DEFAULT_SEAT_PRICE;
        Booking booking = Booking.builder()
                .userId(userId)
                .showId(request.getShowId())
                .bookingReference(UUID.randomUUID().toString().toUpperCase())
                .totalAmount(totalAmount)
                .bookingTime(now)
                .status(BookingStatus.INITIATED)
                .build();

        for (ShowSeat seat : showSeats) {
            BookingSeat bookingSeat = BookingSeat.builder()
                    .seatNumber(seat.getSeatNumber())
                    .build();
            booking.addSeat(bookingSeat);
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Successfully created booking {} in INITIATED state for user {}", savedBooking.getBookingReference(), userId);

        return mapToBookingResponse(savedBooking);
    }

    @Transactional
    public BookingResponse confirmBooking(Long bookingId) {
        log.info("Confirming Booking ID: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + bookingId + " not found"));

        if (booking.getStatus() != BookingStatus.INITIATED) {
            throw new InvalidBookingStateException("Booking cannot be confirmed because it is in state: " + booking.getStatus());
        }

        List<String> seatNumbers = booking.getSeats().stream()
                .map(BookingSeat::getSeatNumber)
                .collect(Collectors.toList());

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatNumberIn(booking.getShowId(), seatNumbers);

        // Transition seats from LOCKED to BOOKED
        for (ShowSeat seat : showSeats) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setLockExpiryTime(null);
            seat.setLockedBy(null);
        }

        showSeatRepository.saveAll(showSeats);

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking confirmedBooking = bookingRepository.save(booking);

        log.info("Booking {} confirmed. seats updated to BOOKED", booking.getBookingReference());
        return mapToBookingResponse(confirmedBooking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String userId, boolean isAdmin) {
        log.info("Cancelling Booking ID: {} triggered by user {}", bookingId, userId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + bookingId + " not found"));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Booking is already cancelled");
        }

        List<String> seatNumbers = booking.getSeats().stream()
                .map(BookingSeat::getSeatNumber)
                .collect(Collectors.toList());

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatNumberIn(booking.getShowId(), seatNumbers);

        // Reset seats back to AVAILABLE
        for (ShowSeat seat : showSeats) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockExpiryTime(null);
            seat.setLockedBy(null);
        }

        showSeatRepository.saveAll(showSeats);

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        log.info("Booking {} successfully cancelled. Seats released to AVAILABLE.", booking.getBookingReference());
        return mapToBookingResponse(cancelledBooking);
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + id + " not found"));
        return mapToBookingResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .showId(booking.getShowId())
                .bookingReference(booking.getBookingReference())
                .totalAmount(booking.getTotalAmount())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus())
                .seatNumbers(booking.getSeats().stream().map(BookingSeat::getSeatNumber).collect(Collectors.toList()))
                .build();
    }
}
