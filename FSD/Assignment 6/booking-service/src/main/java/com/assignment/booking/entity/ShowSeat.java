package com.assignment.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "show_seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "show_id", nullable = false)
    private Long showId;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(name = "row_number", nullable = false)
    private String rowNumber;

    @Column(name = "seat_type", nullable = false)
    private String seatType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    @Column(name = "lock_expiry_time")
    private LocalDateTime lockExpiryTime;

    @Column(name = "locked_by")
    private String lockedBy;

    @Version
    private Long version;
}
