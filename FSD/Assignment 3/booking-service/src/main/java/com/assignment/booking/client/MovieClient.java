package com.assignment.booking.client;

import com.assignment.booking.dto.MovieDto;
import com.assignment.booking.exception.MovieServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Component
@Slf4j
public class MovieClient {

    private final WebClient webClient;

    public MovieClient(WebClient.Builder webClientBuilder, @Value("${services.movie-service.url}") String movieServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(movieServiceUrl).build();
    }

    public MovieDto getMovieDetails(Long movieId) {
        try {
            return webClient.get()
                    .uri("/movies/{id}", movieId)
                    .retrieve()
                    .bodyToMono(MovieDto.class)
                    .timeout(Duration.ofSeconds(3))
                    .onErrorMap(throwable -> {
                        log.error("Error communicating with Movie Service: {}", throwable.getMessage());
                        return new MovieServiceUnavailableException("Movie Service unavailable");
                    })
                    .block();
        } catch (MovieServiceUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in Movie Service communication: {}", e.getMessage());
            throw new MovieServiceUnavailableException("Movie Service unavailable");
        }
    }
}
