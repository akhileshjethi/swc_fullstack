package com.assignment.catalog.service;

import com.assignment.catalog.dto.AuditoriumDTO;

import java.util.List;

public interface AuditoriumService {
    AuditoriumDTO createAuditorium(AuditoriumDTO auditoriumDTO);
    AuditoriumDTO getAuditoriumById(String id);
    List<AuditoriumDTO> getAllAuditoriums();
    AuditoriumDTO updateAuditorium(String id, AuditoriumDTO auditoriumDTO);
    void deleteAuditorium(String id);
}
