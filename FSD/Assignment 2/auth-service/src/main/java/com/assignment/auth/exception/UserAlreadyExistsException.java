package com.assignment.auth.exception;

/**
 * Exception thrown when a user tries to register with an email that already exists.
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
