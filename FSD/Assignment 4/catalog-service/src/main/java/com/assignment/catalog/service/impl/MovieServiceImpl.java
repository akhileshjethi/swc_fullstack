package com.assignment.catalog.service.impl;

import com.assignment.catalog.dto.MovieDTO;
import com.assignment.catalog.entity.Movie;
import com.assignment.catalog.exception.ResourceNotFoundException;
import com.assignment.catalog.mapper.CatalogMapper;
import com.assignment.catalog.repository.MovieRepository;
import com.assignment.catalog.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final CatalogMapper mapper;

    @Override
    public MovieDTO createMovie(MovieDTO movieDTO) {
        Movie movie = mapper.toMovie(movieDTO);
        movie.setId(null);
        Movie saved = movieRepository.save(movie);
        return mapper.toMovieDTO(saved);
    }

    @Override
    public MovieDTO getMovieById(String id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        return mapper.toMovieDTO(movie);
    }

    @Override
    public List<MovieDTO> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(mapper::toMovieDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<MovieDTO> getAllMoviesPaginated(Pageable pageable) {
        return movieRepository.findAll(pageable).map(mapper::toMovieDTO);
    }

    @Override
    public MovieDTO updateMovie(String id, MovieDTO movieDTO) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        
        movie.setTitle(movieDTO.getTitle());
        movie.setGenre(movieDTO.getGenre());
        movie.setLanguage(movieDTO.getLanguage());
        movie.setDuration(movieDTO.getDuration());
        movie.setRating(movieDTO.getRating());
        movie.setReleaseDate(movieDTO.getReleaseDate());
        movie.setDescription(movieDTO.getDescription());
        movie.setPosterUrl(movieDTO.getPosterUrl());
        
        Movie updated = movieRepository.save(movie);
        return mapper.toMovieDTO(updated);
    }

    @Override
    public void deleteMovie(String id) {
        if (!movieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
    }

    @Override
    public List<MovieDTO> searchMovies(String title, String genre) {
        List<Movie> results;
        boolean hasTitle = title != null && !title.trim().isEmpty();
        boolean hasGenre = genre != null && !genre.trim().isEmpty();

        if (hasTitle && hasGenre) {
            results = movieRepository.findByTitleContainingIgnoreCaseAndGenreContainingIgnoreCase(title.trim(), genre.trim());
        } else if (hasTitle) {
            results = movieRepository.findByTitleContainingIgnoreCase(title.trim());
        } else if (hasGenre) {
            results = movieRepository.findByGenreContainingIgnoreCase(genre.trim());
        } else {
            results = movieRepository.findAll();
        }

        return results.stream()
                .map(mapper::toMovieDTO)
                .collect(Collectors.toList());
    }
}
