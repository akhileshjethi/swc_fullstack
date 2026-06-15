package com.assignment.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheatreDTO {
    private String id;

    @NotBlank(message = "Theatre name is required")
    private String theatreName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Location ID is required")
    private String locationId;

    private String ownerId;
}
