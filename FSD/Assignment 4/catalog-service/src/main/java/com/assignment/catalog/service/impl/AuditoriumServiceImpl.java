package com.assignment.catalog.service.impl;

import com.assignment.catalog.dto.AuditoriumDTO;
import com.assignment.catalog.entity.Auditorium;
import com.assignment.catalog.exception.ResourceNotFoundException;
import com.assignment.catalog.mapper.CatalogMapper;
import com.assignment.catalog.repository.AuditoriumRepository;
import com.assignment.catalog.repository.TheatreRepository;
import com.assignment.catalog.service.AuditoriumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditoriumServiceImpl implements AuditoriumService {

    private final AuditoriumRepository auditoriumRepository;
    private final TheatreRepository theatreRepository;
    private final CatalogMapper mapper;

    @Override
    public AuditoriumDTO createAuditorium(AuditoriumDTO auditoriumDTO) {
        if (!theatreRepository.existsById(auditoriumDTO.getTheatreId())) {
            throw new ResourceNotFoundException("Cannot create Auditorium. Theatre not found with id: " + auditoriumDTO.getTheatreId());
        }
        Auditorium auditorium = mapper.toAuditorium(auditoriumDTO);
        auditorium.setId(null);
        Auditorium saved = auditoriumRepository.save(auditorium);
        return mapper.toAuditoriumDTO(saved);
    }

    @Override
    public AuditoriumDTO getAuditoriumById(String id) {
        Auditorium auditorium = auditoriumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auditorium not found with id: " + id));
        return mapper.toAuditoriumDTO(auditorium);
    }

    @Override
    public List<AuditoriumDTO> getAllAuditoriums() {
        return auditoriumRepository.findAll().stream()
                .map(mapper::toAuditoriumDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AuditoriumDTO updateAuditorium(String id, AuditoriumDTO auditoriumDTO) {
        Auditorium auditorium = auditoriumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auditorium not found with id: " + id));

        if (!theatreRepository.existsById(auditoriumDTO.getTheatreId())) {
            throw new ResourceNotFoundException("Cannot update Auditorium. Theatre not found with id: " + auditoriumDTO.getTheatreId());
        }

        auditorium.setScreenName(auditoriumDTO.getScreenName());
        auditorium.setTheatreId(auditoriumDTO.getTheatreId());
        auditorium.setTotalSeats(auditoriumDTO.getTotalSeats());
        auditorium.setSeatLayout(mapper.toAuditorium(auditoriumDTO).getSeatLayout());

        Auditorium updated = auditoriumRepository.save(auditorium);
        return mapper.toAuditoriumDTO(updated);
    }

    @Override
    public void deleteAuditorium(String id) {
        if (!auditoriumRepository.existsById(id)) {
            throw new ResourceNotFoundException("Auditorium not found with id: " + id);
        }
        auditoriumRepository.deleteById(id);
    }
}
