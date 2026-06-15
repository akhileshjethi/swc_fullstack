package com.assignment.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowRequest {

    @NotBlank(message = "Movie ID is required")
    private String movieId;

    @NotBlank(message = "Theatre ID is required")
    private String theatreId;

    @NotBlank(message = "Auditorium ID is required")
    private String auditoriumId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @NotBlank(message = "Language is required")
    private String language;
}
