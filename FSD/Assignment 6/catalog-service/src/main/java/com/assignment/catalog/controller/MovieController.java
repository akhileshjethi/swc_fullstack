package com.assignment.catalog.controller;

import com.assignment.catalog.dto.MovieDTO;
import com.assignment.catalog.response.ApiResponse;
import com.assignment.catalog.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MovieDTO>> createMovie(@Valid @RequestBody MovieDTO movieDTO) {
        MovieDTO created = movieService.createMovie(movieDTO);
        return new ResponseEntity<>(
                ApiResponse.success("Movie created successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MovieDTO>> getMovieById(@PathVariable String id) {
        MovieDTO movie = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success("Movie retrieved successfully", movie));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<MovieDTO>>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toLowerCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<MovieDTO> movies = movieService.getAllMoviesPaginated(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Movies retrieved successfully", movies));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MovieDTO>> updateMovie(
            @PathVariable String id,
            @Valid @RequestBody MovieDTO movieDTO) {
        MovieDTO updated = movieService.updateMovie(id, movieDTO);
        return ResponseEntity.ok(ApiResponse.success("Movie updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable String id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<MovieDTO>>> searchMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre) {
        List<MovieDTO> results = movieService.searchMovies(title, genre);
        return ResponseEntity.ok(ApiResponse.success("Movies search results retrieved", results));
    }
}
