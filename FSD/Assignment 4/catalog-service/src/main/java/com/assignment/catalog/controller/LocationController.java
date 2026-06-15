package com.assignment.catalog.controller;

import com.assignment.catalog.dto.LocationDTO;
import com.assignment.catalog.response.ApiResponse;
import com.assignment.catalog.service.LocationService;
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
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LocationDTO>> createLocation(@Valid @RequestBody LocationDTO locationDTO) {
        LocationDTO created = locationService.createLocation(locationDTO);
        return new ResponseEntity<>(
                ApiResponse.success("Location created successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LocationDTO>> getLocationById(@PathVariable String id) {
        LocationDTO location = locationService.getLocationById(id);
        return ResponseEntity.ok(ApiResponse.success("Location retrieved successfully", location));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'THEATRE_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LocationDTO>>> getAllLocations() {
        List<LocationDTO> locations = locationService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.success("Locations retrieved successfully", locations));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LocationDTO>> updateLocation(
            @PathVariable String id,
            @Valid @RequestBody LocationDTO locationDTO) {
        LocationDTO updated = locationService.updateLocation(id, locationDTO);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable String id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success("Location deleted successfully", null));
    }
}
