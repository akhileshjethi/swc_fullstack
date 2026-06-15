package com.assignment.catalog.controller;

import com.assignment.catalog.dto.AuditoriumDTO;
import com.assignment.catalog.response.ApiResponse;
import com.assignment.catalog.service.AuditoriumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auditoriums")
@RequiredArgsConstructor
public class AuditoriumController {

    private final AuditoriumService auditoriumService;

    @PostMapping
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AuditoriumDTO>> createAuditorium(@Valid @RequestBody AuditoriumDTO auditoriumDTO) {
        AuditoriumDTO created = auditoriumService.createAuditorium(auditoriumDTO);
        return new ResponseEntity<>(
                ApiResponse.success("Auditorium created successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AuditoriumDTO>> getAuditoriumById(@PathVariable String id) {
        AuditoriumDTO auditorium = auditoriumService.getAuditoriumById(id);
        return ResponseEntity.ok(ApiResponse.success("Auditorium retrieved successfully", auditorium));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditoriumDTO>>> getAllAuditoriums() {
        List<AuditoriumDTO> auditoriums = auditoriumService.getAllAuditoriums();
        return ResponseEntity.ok(ApiResponse.success("Auditoriums retrieved successfully", auditoriums));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AuditoriumDTO>> updateAuditorium(
            @PathVariable String id,
            @Valid @RequestBody AuditoriumDTO auditoriumDTO) {
        AuditoriumDTO updated = auditoriumService.updateAuditorium(id, auditoriumDTO);
        return ResponseEntity.ok(ApiResponse.success("Auditorium updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAuditorium(@PathVariable String id) {
        auditoriumService.deleteAuditorium(id);
        return ResponseEntity.ok(ApiResponse.success("Auditorium deleted successfully", null));
    }
}
