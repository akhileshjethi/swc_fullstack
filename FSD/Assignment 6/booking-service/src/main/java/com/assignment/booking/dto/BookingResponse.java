package com.assignment.booking.dto;

import com.assignment.booking.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String userId;
    private Long showId;
    private String bookingReference;
    private Double totalAmount;
    private LocalDateTime bookingTime;
    private BookingStatus status;
    private List<String> seatNumbers;
}
