package com.assignment.catalog.controller;

import com.assignment.catalog.dto.TheatreDTO;
import com.assignment.catalog.response.ApiResponse;
import com.assignment.catalog.service.TheatreService;
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

@RestController
@RequestMapping("/theatres")
@RequiredArgsConstructor
public class TheatreController {

    private final TheatreService theatreService;

    @PostMapping
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TheatreDTO>> createTheatre(@Valid @RequestBody TheatreDTO theatreDTO) {
        TheatreDTO created = theatreService.createTheatre(theatreDTO);
        return new ResponseEntity<>(
                ApiResponse.success("Theatre created successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TheatreDTO>> getTheatreById(@PathVariable String id) {
        TheatreDTO theatre = theatreService.getTheatreById(id);
        return ResponseEntity.ok(ApiResponse.success("Theatre retrieved successfully", theatre));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<TheatreDTO>>> getAllTheatres(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "theatreName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toLowerCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<TheatreDTO> theatres = theatreService.getAllTheatresPaginated(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Theatres retrieved successfully", theatres));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TheatreDTO>> updateTheatre(
            @PathVariable String id,
            @Valid @RequestBody TheatreDTO theatreDTO) {
        TheatreDTO updated = theatreService.updateTheatre(id, theatreDTO);
        return ResponseEntity.ok(ApiResponse.success("Theatre updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTheatre(@PathVariable String id) {
        theatreService.deleteTheatre(id);
        return ResponseEntity.ok(ApiResponse.success("Theatre deleted successfully", null));
    }
}
