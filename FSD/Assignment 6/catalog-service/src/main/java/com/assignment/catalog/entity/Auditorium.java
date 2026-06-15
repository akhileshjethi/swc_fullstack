package com.assignment.catalog.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "auditoriums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auditorium {
    @Id
    private String id;
    private String screenName;
    private String theatreId;
    private Integer totalSeats;
    private List<Seat> seatLayout;
}
