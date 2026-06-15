package com.assignment.catalog.service;

import com.assignment.catalog.dto.LocationDTO;

import java.util.List;

public interface LocationService {
    LocationDTO createLocation(LocationDTO locationDTO);
    LocationDTO getLocationById(String id);
    List<LocationDTO> getAllLocations();
    LocationDTO updateLocation(String id, LocationDTO locationDTO);
    void deleteLocation(String id);
}
