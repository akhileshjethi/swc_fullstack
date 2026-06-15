package com.assignment.booking.controller;

import com.assignment.booking.dto.ShowRequest;
import com.assignment.booking.dto.ShowResponse;
import com.assignment.booking.dto.ShowSeatResponse;
import com.assignment.booking.response.ApiResponse;
import com.assignment.booking.service.ShowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'THEATRE_OWNER')")
    public ResponseEntity<ApiResponse<ShowResponse>> createShow(@Valid @RequestBody ShowRequest request) {
        ShowResponse created = showService.createShow(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Show created successfully", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowResponse>> getShowById(@PathVariable Long id) {
        ShowResponse show = showService.getShowById(id);
        return ResponseEntity.ok(ApiResponse.success("Show retrieved successfully", show));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ShowResponse>>> getAllShows(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ShowResponse> shows = showService.getAllShows(pageable);
        return ResponseEntity.ok(ApiResponse.success("Shows retrieved successfully", shows));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ShowResponse>>> searchShows(
            @RequestParam(required = false) String movieId,
            @RequestParam(required = false) String theatreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<ShowResponse> shows = showService.searchShows(movieId, theatreId, date);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", shows));
    }

    @GetMapping("/{showId}/seats")
    public ResponseEntity<ApiResponse<List<ShowSeatResponse>>> getShowSeats(@PathVariable Long showId) {
        List<ShowSeatResponse> seats = showService.getShowSeats(showId);
        return ResponseEntity.ok(ApiResponse.success("Show seats retrieved successfully", seats));
    }
}
