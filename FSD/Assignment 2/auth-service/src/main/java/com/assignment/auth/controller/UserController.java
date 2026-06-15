package com.assignment.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demo controller containing user role protected endpoints.
 */
@RestController
@RequestMapping("/user")
public class UserController {

    /**
     * Get user profile details (only accessible to users with ROLE_USER).
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, String>> getUserProfile() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the User Profile page! Access granted for role USER."
        ));
    }
}
