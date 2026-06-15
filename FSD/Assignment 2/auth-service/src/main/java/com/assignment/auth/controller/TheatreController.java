package com.assignment.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demo controller containing theatre-owner role protected endpoints.
 */
@RestController
@RequestMapping("/theatre")
public class TheatreController {

    /**
     * Get theatre dashboard (only accessible to users with ROLE_THEATRE_OWNER).
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('THEATRE_OWNER')")
    public ResponseEntity<Map<String, String>> getTheatreDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Theatre Owner Dashboard! Access granted for role THEATRE_OWNER."
        ));
    }
}
