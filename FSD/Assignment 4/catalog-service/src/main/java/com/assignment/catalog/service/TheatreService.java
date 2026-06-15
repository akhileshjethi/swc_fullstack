package com.assignment.catalog.service;

import com.assignment.catalog.dto.TheatreDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TheatreService {
    TheatreDTO createTheatre(TheatreDTO theatreDTO);
    TheatreDTO getTheatreById(String id);
    List<TheatreDTO> getAllTheatres();
    Page<TheatreDTO> getAllTheatresPaginated(Pageable pageable);
    TheatreDTO updateTheatre(String id, TheatreDTO theatreDTO);
    void deleteTheatre(String id);
}
