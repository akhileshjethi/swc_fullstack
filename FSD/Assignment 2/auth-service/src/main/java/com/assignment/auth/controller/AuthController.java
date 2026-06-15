package com.assignment.auth.controller;

import com.assignment.auth.dto.AuthResponse;
import com.assignment.auth.dto.LoginRequest;
import com.assignment.auth.dto.RegisterRequest;
import com.assignment.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller to expose endpoints for user registration and authentication login.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint for user registration.
     *
     * @param registerRequest details for new registration
     * @return a confirmation message response
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.registerUser(registerRequest);
        return new ResponseEntity<>(
                Map.of("message", "User registered successfully"),
                HttpStatus.CREATED
        );
    }

    /**
     * Endpoint for user login.
     *
     * @param loginRequest login credentials
     * @return AuthResponse containing token and user profile
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    }
}
