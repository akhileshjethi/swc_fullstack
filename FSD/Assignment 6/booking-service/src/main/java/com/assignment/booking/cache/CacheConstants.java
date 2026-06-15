package com.assignment.booking.cache;

/**
 * Centralized cache name constants for Booking Service.
 * Ensures consistent naming across @Cacheable, @CacheEvict annotations.
 *
 * Cache Key Strategy:
 *   show::1            → Single show by ID
 *   shows::SimpleKey[] → Paginated shows (not cached)
 *   seatAvailability::25 → Seat layout for show ID 25
 */
public final class CacheConstants {

    private CacheConstants() {
        // Utility class - prevent instantiation
    }

    // Show caches (Booking Service) - TTL: 10 minutes
    public static final String SHOWS_CACHE = "shows";
    public static final String SHOW_CACHE = "show";

    // Seat availability cache (Booking Service) - TTL: 2 minutes (most critical)
    public static final String SEAT_AVAILABILITY_CACHE = "seatAvailability";
}
