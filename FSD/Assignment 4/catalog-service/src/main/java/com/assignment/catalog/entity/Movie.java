package com.assignment.catalog.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    private String id;
    private String title;
    private String genre;
    private String language;
    private Integer duration;
    private Double rating;
    private LocalDate releaseDate;
    private String description;
    private String posterUrl;
}
