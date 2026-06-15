package com.assignment.booking.dto;

import com.assignment.booking.entity.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowSeatResponse {
    private String seatNumber;
    private String rowNumber;
    private String seatType;
    private SeatStatus status;
    private LocalDateTime lockExpiryTime;
}
