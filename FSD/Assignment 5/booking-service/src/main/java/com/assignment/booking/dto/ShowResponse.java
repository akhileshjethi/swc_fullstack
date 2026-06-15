package com.assignment.booking.dto;

import com.assignment.booking.entity.ShowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowResponse {
    private Long id;
    private String movieId;
    private String theatreId;
    private String auditoriumId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String language;
    private ShowStatus status;
}
