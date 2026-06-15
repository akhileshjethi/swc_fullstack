package com.assignment.catalog.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    private String seatNumber;
    private String rowNumber;
    private String seatType;
    private Double priceMultiplier;
}
