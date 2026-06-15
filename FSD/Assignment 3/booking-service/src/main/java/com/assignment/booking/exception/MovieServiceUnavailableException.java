package com.assignment.booking.exception;

public class MovieServiceUnavailableException extends RuntimeException {
    public MovieServiceUnavailableException(String message) {
        super(message);
    }
}
