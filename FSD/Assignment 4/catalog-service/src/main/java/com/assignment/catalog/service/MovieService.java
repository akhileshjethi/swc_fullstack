package com.assignment.catalog.service;

import com.assignment.catalog.dto.MovieDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MovieService {
    MovieDTO createMovie(MovieDTO movieDTO);
    MovieDTO getMovieById(String id);
    List<MovieDTO> getAllMovies();
    Page<MovieDTO> getAllMoviesPaginated(Pageable pageable);
    MovieDTO updateMovie(String id, MovieDTO movieDTO);
    void deleteMovie(String id);
    List<MovieDTO> searchMovies(String title, String genre);
}
