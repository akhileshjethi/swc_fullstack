package com.assignment.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demo controller containing admin role protected endpoints.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    /**
     * Get list of admin users details (only accessible to users with ROLE_ADMIN).
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAdminUsers() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Admin user management board! Access granted for role ADMIN."
        ));
    }
}
