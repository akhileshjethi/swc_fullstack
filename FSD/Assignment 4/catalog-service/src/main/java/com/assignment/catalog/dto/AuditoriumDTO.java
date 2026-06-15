package com.assignment.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriumDTO {
    private String id;

    @NotBlank(message = "Screen name is required")
    private String screenName;

    @NotBlank(message = "Theatre ID is required")
    private String theatreId;

    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Total seats must be greater than 0")
    private Integer totalSeats;

    @NotEmpty(message = "Seat layout cannot be empty")
    @Valid
    private List<SeatDTO> seatLayout;
}
