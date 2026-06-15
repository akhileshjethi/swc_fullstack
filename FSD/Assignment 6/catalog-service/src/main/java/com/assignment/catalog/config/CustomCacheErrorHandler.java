package com.assignment.catalog.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;

/**
 * Custom cache error handler that gracefully handles Redis failures.
 * When Redis is unavailable, the application falls back to database queries
 * instead of throwing exceptions, ensuring service continuity.
 */
@Slf4j
public class CustomCacheErrorHandler implements CacheErrorHandler {

    @Override
    public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
        log.error("CACHE GET ERROR - Cache: '{}', Key: '{}', Error: {}",
                cache.getName(), key, exception.getMessage());
        log.warn("Falling back to database query for cache '{}' key '{}'", cache.getName(), key);
    }

    @Override
    public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
        log.error("CACHE PUT ERROR - Cache: '{}', Key: '{}', Error: {}",
                cache.getName(), key, exception.getMessage());
        log.warn("Failed to update cache '{}'. Data is served but not cached.", cache.getName());
    }

    @Override
    public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
        log.error("CACHE EVICT ERROR - Cache: '{}', Key: '{}', Error: {}",
                cache.getName(), key, exception.getMessage());
        log.warn("Failed to evict cache '{}'. Stale data may persist until TTL expiry.", cache.getName());
    }

    @Override
    public void handleCacheClearError(RuntimeException exception, Cache cache) {
        log.error("CACHE CLEAR ERROR - Cache: '{}', Error: {}",
                cache.getName(), exception.getMessage());
        log.warn("Failed to clear cache '{}'. Stale data may persist until TTL expiry.", cache.getName());
    }
}
