package com.assignment.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDTO {
    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    @NotBlank(message = "Row number is required")
    private String rowNumber;

    @NotBlank(message = "Seat type is required")
    private String seatType;

    @NotNull(message = "Price multiplier is required")
    private Double priceMultiplier;
}
