package com.assignment.auth.service.impl;

import com.assignment.auth.dto.AuthResponse;
import com.assignment.auth.dto.LoginRequest;
import com.assignment.auth.dto.RegisterRequest;
import com.assignment.auth.entity.User;
import com.assignment.auth.exception.InvalidCredentialsException;
import com.assignment.auth.exception.UserAlreadyExistsException;
import com.assignment.auth.repository.UserRepository;
import com.assignment.auth.security.JwtTokenProvider;
import com.assignment.auth.security.UserPrincipal;
import com.assignment.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of the AuthService interface.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public void registerUser(RegisterRequest registerRequest) {
        // Check if the email is already registered
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered: " + registerRequest.getEmail());
        }

        // Create user entity and encrypt the password
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .build();

        // Save to database
        userRepository.save(user);
    }

    @Override
    @Transactional
    public AuthResponse loginUser(LoginRequest loginRequest) {
        try {
            // Authenticate the user credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Establish the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate token
            String jwt = tokenProvider.generateToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            return AuthResponse.builder()
                    .token(jwt)
                    .email(userPrincipal.getUsername())
                    .role(userPrincipal.getUser().getRole())
                    .build();

        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }
}
