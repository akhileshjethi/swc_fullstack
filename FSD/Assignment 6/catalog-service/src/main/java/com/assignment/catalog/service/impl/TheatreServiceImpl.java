package com.assignment.catalog.service.impl;

import com.assignment.catalog.cache.CacheConstants;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TheatreServiceImpl implements TheatreService {

    private final TheatreRepository theatreRepository;
    private final LocationRepository locationRepository;
    private final AuditoriumRepository auditoriumRepository;
    private final CatalogMapper mapper;

    @Override
    @CacheEvict(value = CacheConstants.THEATRES_CACHE, allEntries = true)
    public TheatreDTO createTheatre(TheatreDTO theatreDTO) {
        log.info("Creating new theatre: '{}'. Evicting '{}' cache.", theatreDTO.getTheatreName(), CacheConstants.THEATRES_CACHE);
        if (!locationRepository.existsById(theatreDTO.getLocationId())) {
            throw new ResourceNotFoundException("Cannot create Theatre. Location not found with id: " + theatreDTO.getLocationId());
        }
        Theatre theatre = mapper.toTheatre(theatreDTO);
        theatre.setId(null);
        Theatre saved = theatreRepository.save(theatre);
        return mapper.toTheatreDTO(saved);
    }

    @Override
    @Cacheable(value = CacheConstants.THEATRE_CACHE, key = "#id")
    public TheatreDTO getTheatreById(String id) {
        log.info("CACHE MISS - Fetching Theatre from DB for id: {}", id);
        Theatre theatre = theatreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + id));
        return mapper.toTheatreDTO(theatre);
    }

    @Override
    @Cacheable(value = CacheConstants.THEATRES_CACHE)
    public List<TheatreDTO> getAllTheatres() {
        log.info("CACHE MISS - Fetching all Theatres from DB");
        return theatreRepository.findAll().stream()
                .map(mapper::toTheatreDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TheatreDTO> getAllTheatresPaginated(Pageable pageable) {
        // Paginated queries are not cached due to variable pagination parameters
        log.debug("Fetching paginated theatres - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return theatreRepository.findAll(pageable).map(mapper::toTheatreDTO);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConstants.THEATRE_CACHE, key = "#id"),
            @CacheEvict(value = CacheConstants.THEATRES_CACHE, allEntries = true)
    })
    public TheatreDTO updateTheatre(String id, TheatreDTO theatreDTO) {
        log.info("Updating theatre id: {}. Evicting '{}' and '{}' caches.",
                id, CacheConstants.THEATRE_CACHE, CacheConstants.THEATRES_CACHE);
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
    @Caching(evict = {
            @CacheEvict(value = CacheConstants.THEATRE_CACHE, key = "#id"),
            @CacheEvict(value = CacheConstants.THEATRES_CACHE, allEntries = true)
    })
    public void deleteTheatre(String id) {
        log.info("Deleting theatre id: {}. Evicting '{}' and '{}' caches.",
                id, CacheConstants.THEATRE_CACHE, CacheConstants.THEATRES_CACHE);
        if (!theatreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Theatre not found with id: " + id);
        }
        if (auditoriumRepository.existsByTheatreId(id)) {
            throw new BadRequestException("Cannot delete Theatre as it has registered Auditoriums");
        }
        theatreRepository.deleteById(id);
    }
}
