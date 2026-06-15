-- Database Schema for Booking Service

-- Drop tables if they exist (ordered to respect foreign keys)
DROP TABLE IF EXISTS booking_seats;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS show_seats;
DROP TABLE IF EXISTS shows;

-- 1. Shows Table
CREATE TABLE shows (
    id BIGSERIAL PRIMARY KEY,
    movie_id VARCHAR(50) NOT NULL,
    theatre_id VARCHAR(50) NOT NULL,
    auditorium_id VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);

-- 2. Show Seats Table (with Optimistic Lock Version column)
CREATE TABLE show_seats (
    id BIGSERIAL PRIMARY KEY,
    show_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    row_number VARCHAR(10) NOT NULL,
    seat_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    lock_expiry_time TIMESTAMP WITHOUT TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_show_seats_show FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);

-- Index for fast status checks and lock expiry cleanups
CREATE INDEX idx_show_seats_lookup ON show_seats(show_id, seat_number);
CREATE INDEX idx_show_seats_expiry ON show_seats(status, lock_expiry_time);

-- 3. Bookings Table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    show_id BIGINT NOT NULL,
    booking_reference VARCHAR(100) UNIQUE NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    booking_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_bookings_show FOREIGN KEY (show_id) REFERENCES shows(id)
);

-- 4. Booking Seats Table
CREATE TABLE booking_seats (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    CONSTRAINT fk_booking_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
