package com.assignment.catalog.service.impl;

import com.assignment.catalog.dto.TheatreDTO;
import com.assignment.catalog.entity.Theatre;
import com.assignment.catalog.exception.BadRequestException;
import com.assignment.catalog.exception.ResourceNotFoundException;
import com.assignment.catalog.mapper.CatalogMapper;
import com.assignment.catalog.repository.AuditoriumRepository;
import com.assignment.catalog.repository.LocationRepository;
import com.assignment.catalog.repository.TheatreRepository;
import com.assignment.catalog.service.TheatreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TheatreServiceImpl implements TheatreService {

    private final TheatreRepository theatreRepository;
    private final LocationRepository locationRepository;
    private final AuditoriumRepository auditoriumRepository;
    private final CatalogMapper mapper;

    @Override
    public TheatreDTO createTheatre(TheatreDTO theatreDTO) {
        if (!locationRepository.existsById(theatreDTO.getLocationId())) {
            throw new ResourceNotFoundException("Cannot create Theatre. Location not found with id: " + theatreDTO.getLocationId());
        }
        Theatre theatre = mapper.toTheatre(theatreDTO);
        theatre.setId(null);
        Theatre saved = theatreRepository.save(theatre);
        return mapper.toTheatreDTO(saved);
    }

    @Override
    public TheatreDTO getTheatreById(String id) {
        Theatre theatre = theatreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + id));
        return mapper.toTheatreDTO(theatre);
    }

    @Override
    public List<TheatreDTO> getAllTheatres() {
        return theatreRepository.findAll().stream()
                .map(mapper::toTheatreDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TheatreDTO> getAllTheatresPaginated(Pageable pageable) {
        return theatreRepository.findAll(pageable).map(mapper::toTheatreDTO);
    }

    @Override
    public TheatreDTO updateTheatre(String id, TheatreDTO theatreDTO) {
        Theatre theatre = theatreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + id));
        
        if (!locationRepository.existsById(theatreDTO.getLocationId())) {
            throw new ResourceNotFoundException("Cannot update Theatre. Location not found with id: " + theatreDTO.getLocationId());
        }
        
        theatre.setTheatreName(theatreDTO.getTheatreName());
        theatre.setAddress(theatreDTO.getAddress());
        theatre.setLocationId(theatreDTO.getLocationId());
        theatre.setOwnerId(theatreDTO.getOwnerId());
        
        Theatre updated = theatreRepository.save(theatre);
        return mapper.toTheatreDTO(updated);
    }

    @Override
    public void deleteTheatre(String id) {
        if (!theatreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Theatre not found with id: " + id);
        }
        if (auditoriumRepository.existsByTheatreId(id)) {
            throw new BadRequestException("Cannot delete Theatre as it has registered Auditoriums");
        }
        theatreRepository.deleteById(id);
    }
}
