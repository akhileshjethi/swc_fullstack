package com.assignment.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CatalogDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovieDto {
        private String id;
        private String title;
        private String genre;
        private Integer durationMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TheatreDto {
        private String id;
        private String name;
        private String city;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuditoriumDto {
        private String id;
        private String name;
        private String theatreId;
        private List<AuditoriumSeatDto> seats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuditoriumSeatDto {
        private String seatNumber;
        private String rowNumber;
        private String seatType;
    }
}
