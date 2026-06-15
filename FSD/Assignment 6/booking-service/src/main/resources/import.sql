-- Sample Test Data Seed for Booking Service

-- Insert Shows
INSERT INTO shows (id, movie_id, theatre_id, auditorium_id, start_time, end_time, language, status) 
VALUES (101, 'MOV100', 'THE100', 'AUD100', '2026-08-01 18:00:00', '2026-08-01 21:00:00', 'English', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shows (id, movie_id, theatre_id, auditorium_id, start_time, end_time, language, status) 
VALUES (102, 'MOV200', 'THE100', 'AUD200', '2026-08-02 20:00:00', '2026-08-02 23:00:00', 'English', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Insert Show Seats for Show 101
INSERT INTO show_seats (id, show_id, seat_number, row_number, seat_type, status, version) 
VALUES (1001, 101, 'A1', 'A', 'REGULAR', 'AVAILABLE', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO show_seats (id, show_id, seat_number, row_number, seat_type, status, version) 
VALUES (1002, 101, 'A2', 'A', 'REGULAR', 'AVAILABLE', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO show_seats (id, show_id, seat_number, row_number, seat_type, status, version) 
VALUES (1003, 101, 'A3', 'A', 'REGULAR', 'AVAILABLE', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO show_seats (id, show_id, seat_number, row_number, seat_type, status, version) 
VALUES (1004, 101, 'B1', 'B', 'VIP', 'AVAILABLE', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO show_seats (id, show_id, seat_number, row_number, seat_type, status, version) 
VALUES (1005, 101, 'B2', 'B', 'VIP', 'AVAILABLE', 0) ON CONFLICT (id) DO NOTHING;
