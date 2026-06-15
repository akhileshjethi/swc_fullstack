package com.assignment.catalog.cache;

/**
 * Centralized cache name constants.
 * Ensures consistent naming across @Cacheable, @CacheEvict, and @CachePut annotations.
 *
 * Cache Key Strategy:
 *   movie::1       → Single movie by ID
 *   movies::SimpleKey[] → All movies list
 *   theatre::abc   → Single theatre by ID
 *   theatres::SimpleKey[] → All theatres list
 */
public final class CacheConstants {

    private CacheConstants() {
        // Utility class - prevent instantiation
    }

    // Movie caches (Catalog Service) - TTL: 30 minutes
    public static final String MOVIES_CACHE = "movies";
    public static final String MOVIE_CACHE = "movie";

    // Theatre caches (Catalog Service) - TTL: 30 minutes
    public static final String THEATRES_CACHE = "theatres";
    public static final String THEATRE_CACHE = "theatre";
}
