package com.assignment.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Movie ID is required")
    @Column(name = "movie_id", nullable = false)
    private String movieId;

    @NotBlank(message = "Theatre ID is required")
    @Column(name = "theatre_id", nullable = false)
    private String theatreId;

    @NotBlank(message = "Auditorium ID is required")
    @Column(name = "auditorium_id", nullable = false)
    private String auditoriumId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @NotBlank(message = "Language is required")
    @Column(nullable = false)
    private String language;

    @NotNull(message = "Show status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShowStatus status;
}
