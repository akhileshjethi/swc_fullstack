package com.assignment.auth.service;

import com.assignment.auth.dto.AuthResponse;
import com.assignment.auth.dto.LoginRequest;
import com.assignment.auth.dto.RegisterRequest;

/**
 * Service interface for user registration and authentication.
 */
public interface AuthService {

    /**
     * Register a new user in the system.
     *
     * @param registerRequest the user registration details
     */
    void registerUser(RegisterRequest registerRequest);

    /**
     * Authenticate a user and generate a JWT token.
     *
     * @param loginRequest the user login credentials
     * @return AuthResponse containing token and user details
     */
    AuthResponse loginUser(LoginRequest loginRequest);
}
