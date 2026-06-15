package com.assignment.booking.service;

import com.assignment.booking.dto.BookingRequest;
import com.assignment.booking.dto.BookingResponse;
import com.assignment.booking.dto.LockSeatRequest;
import com.assignment.booking.entity.BookingStatus;
import com.assignment.booking.entity.SeatStatus;
import com.assignment.booking.entity.Show;
import com.assignment.booking.entity.ShowSeat;
import com.assignment.booking.entity.ShowStatus;
import com.assignment.booking.exception.CustomExceptions.SeatAlreadyLockedException;
import com.assignment.booking.repository.BookingRepository;
import com.assignment.booking.repository.ShowRepository;
import com.assignment.booking.repository.ShowSeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BookingServiceTests {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Long testShowId;

    @BeforeEach
    public void setUp() {
        bookingRepository.deleteAll();
        showSeatRepository.deleteAll();
        showRepository.deleteAll();

        // Create a test show
        Show show = Show.builder()
                .movieId("MOV100")
                .theatreId("THE100")
                .auditoriumId("AUD100")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(3))
                .language("English")
                .status(ShowStatus.ACTIVE)
                .build();
        Show savedShow = showRepository.save(show);
        testShowId = savedShow.getId();

        // Create test show seats
        ShowSeat seat1 = ShowSeat.builder()
                .showId(testShowId)
                .seatNumber("A1")
                .rowNumber("A")
                .seatType("REGULAR")
                .status(SeatStatus.AVAILABLE)
                .build();

        ShowSeat seat2 = ShowSeat.builder()
                .showId(testShowId)
                .seatNumber("A2")
                .rowNumber("A")
                .seatType("REGULAR")
                .status(SeatStatus.AVAILABLE)
                .build();

        showSeatRepository.save(seat1);
        showSeatRepository.save(seat2);
    }

    @Test
    @Transactional
    public void testSeatLockingAndBookingWorkflow() {
        String userId = "user123";
        List<String> seats = Collections.singletonList("A1");

        // 1. Lock Seats
        LockSeatRequest lockRequest = LockSeatRequest.builder()
                .showId(testShowId)
                .seatNumbers(seats)
                .build();

        bookingService.lockSeats(lockRequest, userId);

        ShowSeat lockedSeat = showSeatRepository.findByShowIdAndSeatNumberIn(testShowId, seats).get(0);
        assertEquals(SeatStatus.LOCKED, lockedSeat.getStatus());
        assertEquals(userId, lockedSeat.getLockedBy());
        assertNotNull(lockedSeat.getLockExpiryTime());

        // 2. Create Booking
        BookingRequest bookingRequest = BookingRequest.builder()
                .showId(testShowId)
                .seatNumbers(seats)
                .build();

        BookingResponse booking = bookingService.createBooking(bookingRequest, userId);
        assertNotNull(booking);
        assertEquals(BookingStatus.INITIATED, booking.getStatus());
        assertEquals(userId, booking.getUserId());
        assertEquals(150.0, booking.getTotalAmount());

        // 3. Confirm Booking
        BookingResponse confirmed = bookingService.confirmBooking(booking.getId());
        assertEquals(BookingStatus.CONFIRMED, confirmed.getStatus());

        ShowSeat bookedSeat = showSeatRepository.findByShowIdAndSeatNumberIn(testShowId, seats).get(0);
        assertEquals(SeatStatus.BOOKED, bookedSeat.getStatus());
        assertNull(bookedSeat.getLockedBy());
    }

    @Test
    public void testSeatAlreadyLockedThrowsException() {
        String userA = "userA";
        String userB = "userB";
        List<String> seats = Collections.singletonList("A1");

        LockSeatRequest lockRequest = LockSeatRequest.builder()
                .showId(testShowId)
                .seatNumbers(seats)
                .build();

        // User A locks seat
        bookingService.lockSeats(lockRequest, userA);

        // User B attempts to lock same seat -> should fail
        assertThrows(SeatAlreadyLockedException.class, () -> {
            bookingService.lockSeats(lockRequest, userB);
        });
    }

    @Test
    public void testOptimisticLockingConcurrencyConflict() {
        List<String> seats = Collections.singletonList("A2");
        
        // Load the same seat into two different entity instances
        ShowSeat seatInstance1 = showSeatRepository.findByShowIdAndSeatNumberIn(testShowId, seats).get(0);
        ShowSeat seatInstance2 = showSeatRepository.findByShowIdAndSeatNumberIn(testShowId, seats).get(0);

        // Modify first instance and save (version increments)
        seatInstance1.setStatus(SeatStatus.LOCKED);
        seatInstance1.setLockedBy("userA");
        showSeatRepository.saveAndFlush(seatInstance1);

        // Try to modify second instance and save (which has old version) -> should fail
        seatInstance2.setStatus(SeatStatus.LOCKED);
        seatInstance2.setLockedBy("userB");

        assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            showSeatRepository.saveAndFlush(seatInstance2);
        });
    }
}
