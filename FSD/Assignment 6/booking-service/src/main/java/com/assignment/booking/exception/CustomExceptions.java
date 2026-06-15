package com.assignment.booking.exception;

public class CustomExceptions {

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    public static class SeatAlreadyLockedException extends RuntimeException {
        public SeatAlreadyLockedException(String message) {
            super(message);
        }
    }

    public static class SeatAlreadyBookedException extends RuntimeException {
        public SeatAlreadyBookedException(String message) {
            super(message);
        }
    }

    public static class InvalidBookingStateException extends RuntimeException {
        public InvalidBookingStateException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) {
            super(message);
        }
    }
}
