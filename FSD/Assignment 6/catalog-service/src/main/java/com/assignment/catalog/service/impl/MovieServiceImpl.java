package com.assignment.catalog.service.impl;

import com.assignment.catalog.cache.CacheConstants;
import com.assignment.catalog.dto.MovieDTO;
import com.assignment.catalog.entity.Movie;
import com.assignment.catalog.exception.ResourceNotFoundException;
import com.assignment.catalog.mapper.CatalogMapper;
import com.assignment.catalog.repository.MovieRepository;
import com.assignment.catalog.service.MovieService;
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
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final CatalogMapper mapper;

    @Override
    @CacheEvict(value = CacheConstants.MOVIES_CACHE, allEntries = true)
    public MovieDTO createMovie(MovieDTO movieDTO) {
        log.info("Creating new movie: '{}'. Evicting '{}' cache.", movieDTO.getTitle(), CacheConstants.MOVIES_CACHE);
        Movie movie = mapper.toMovie(movieDTO);
        movie.setId(null);
        Movie saved = movieRepository.save(movie);
        return mapper.toMovieDTO(saved);
    }

    @Override
    @Cacheable(value = CacheConstants.MOVIE_CACHE, key = "#id")
    public MovieDTO getMovieById(String id) {
        log.info("CACHE MISS - Fetching Movie from DB for id: {}", id);
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        return mapper.toMovieDTO(movie);
    }

    @Override
    @Cacheable(value = CacheConstants.MOVIES_CACHE)
    public List<MovieDTO> getAllMovies() {
        log.info("CACHE MISS - Fetching all Movies from DB");
        return movieRepository.findAll().stream()
                .map(mapper::toMovieDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<MovieDTO> getAllMoviesPaginated(Pageable pageable) {
        // Paginated queries are not cached due to variable pagination parameters
        log.debug("Fetching paginated movies - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return movieRepository.findAll(pageable).map(mapper::toMovieDTO);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConstants.MOVIE_CACHE, key = "#id"),
            @CacheEvict(value = CacheConstants.MOVIES_CACHE, allEntries = true)
    })
    public MovieDTO updateMovie(String id, MovieDTO movieDTO) {
        log.info("Updating movie id: {}. Evicting '{}' and '{}' caches.",
                id, CacheConstants.MOVIE_CACHE, CacheConstants.MOVIES_CACHE);
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
    @Caching(evict = {
            @CacheEvict(value = CacheConstants.MOVIE_CACHE, key = "#id"),
            @CacheEvict(value = CacheConstants.MOVIES_CACHE, allEntries = true)
    })
    public void deleteMovie(String id) {
        log.info("Deleting movie id: {}. Evicting '{}' and '{}' caches.",
                id, CacheConstants.MOVIE_CACHE, CacheConstants.MOVIES_CACHE);
        if (!movieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
    }

    @Override
    public List<MovieDTO> searchMovies(String title, String genre) {
        // Search queries with dynamic parameters are not cached
        log.debug("Searching movies - title: '{}', genre: '{}'", title, genre);
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
