package com.assignment.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String bookingId;
    private String movieTitle;
    private Double totalAmount;
    private String userEmail;
    private String userRole;
    private String status;
}
