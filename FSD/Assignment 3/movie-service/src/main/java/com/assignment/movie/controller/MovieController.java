package com.assignment.movie.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movies")
public class MovieController {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieResponse {
        private Long id;
        private String title;
        private Double price;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovieById(@PathVariable("id") Long id) {
        if (id == 1) {
            return ResponseEntity.ok(MovieResponse.builder().id(1L).title("Avengers").price(250.0).build());
        } else if (id == 2) {
            return ResponseEntity.ok(MovieResponse.builder().id(2L).title("Inception").price(300.0).build());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
