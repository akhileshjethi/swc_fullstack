package com.assignment.booking.service;

import com.assignment.booking.entity.SeatStatus;
import com.assignment.booking.entity.ShowSeat;
import com.assignment.booking.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LockCleanupScheduler {

    private final ShowSeatRepository showSeatRepository;

    // Run every 30 seconds to clean up expired locks
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void cleanupExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();
        List<ShowSeat> expiredSeats = showSeatRepository.findExpiredLocks(SeatStatus.LOCKED, now);

        if (!expiredSeats.isEmpty()) {
            log.info("Found {} expired seat locks. Releasing to AVAILABLE.", expiredSeats.size());
            for (ShowSeat seat : expiredSeats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockExpiryTime(null);
                seat.setLockedBy(null);
            }
            showSeatRepository.saveAll(expiredSeats);
            log.info("Released all expired seat locks successfully.");
        }
    }
}
