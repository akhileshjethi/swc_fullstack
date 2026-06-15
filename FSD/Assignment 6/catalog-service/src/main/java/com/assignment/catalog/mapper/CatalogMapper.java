package com.assignment.catalog.mapper;

import com.assignment.catalog.dto.AuditoriumDTO;
import com.assignment.catalog.dto.LocationDTO;
import com.assignment.catalog.dto.MovieDTO;
import com.assignment.catalog.dto.SeatDTO;
import com.assignment.catalog.dto.TheatreDTO;
import com.assignment.catalog.entity.Auditorium;
import com.assignment.catalog.entity.Location;
import com.assignment.catalog.entity.Movie;
import com.assignment.catalog.entity.Seat;
import com.assignment.catalog.entity.Theatre;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CatalogMapper {

    public MovieDTO toMovieDTO(Movie movie) {
        if (movie == null) return null;
        return MovieDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .genre(movie.getGenre())
                .language(movie.getLanguage())
                .duration(movie.getDuration())
                .rating(movie.getRating())
                .releaseDate(movie.getReleaseDate())
                .description(movie.getDescription())
                .posterUrl(movie.getPosterUrl())
                .build();
    }

    public Movie toMovie(MovieDTO dto) {
        if (dto == null) return null;
        return Movie.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .genre(dto.getGenre())
                .language(dto.getLanguage())
                .duration(dto.getDuration())
                .rating(dto.getRating())
                .releaseDate(dto.getReleaseDate())
                .description(dto.getDescription())
                .posterUrl(dto.getPosterUrl())
                .build();
    }

    public LocationDTO toLocationDTO(Location location) {
        if (location == null) return null;
        return LocationDTO.builder()
                .id(location.getId())
                .city(location.getCity())
                .state(location.getState())
                .country(location.getCountry())
                .build();
    }

    public Location toLocation(LocationDTO dto) {
        if (dto == null) return null;
        return Location.builder()
                .id(dto.getId())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .build();
    }

    public TheatreDTO toTheatreDTO(Theatre theatre) {
        if (theatre == null) return null;
        return TheatreDTO.builder()
                .id(theatre.getId())
                .theatreName(theatre.getTheatreName())
                .address(theatre.getAddress())
                .locationId(theatre.getLocationId())
                .ownerId(theatre.getOwnerId())
                .build();
    }

    public Theatre toTheatre(TheatreDTO dto) {
        if (dto == null) return null;
        return Theatre.builder()
                .id(dto.getId())
                .theatreName(dto.getTheatreName())
                .address(dto.getAddress())
                .locationId(dto.getLocationId())
                .ownerId(dto.getOwnerId())
                .build();
    }

    public SeatDTO toSeatDTO(Seat seat) {
        if (seat == null) return null;
        return SeatDTO.builder()
                .seatNumber(seat.getSeatNumber())
                .rowNumber(seat.getRowNumber())
                .seatType(seat.getSeatType())
                .priceMultiplier(seat.getPriceMultiplier())
                .build();
    }

    public Seat toSeat(SeatDTO dto) {
        if (dto == null) return null;
        return Seat.builder()
                .seatNumber(dto.getSeatNumber())
                .rowNumber(dto.getRowNumber())
                .seatType(dto.getSeatType())
                .priceMultiplier(dto.getPriceMultiplier())
                .build();
    }

    public AuditoriumDTO toAuditoriumDTO(Auditorium auditorium) {
        if (auditorium == null) return null;
        List<SeatDTO> seats = auditorium.getSeatLayout() == null ? Collections.emptyList() :
                auditorium.getSeatLayout().stream().map(this::toSeatDTO).collect(Collectors.toList());
        return AuditoriumDTO.builder()
                .id(auditorium.getId())
                .screenName(auditorium.getScreenName())
                .theatreId(auditorium.getTheatreId())
                .totalSeats(auditorium.getTotalSeats())
                .seatLayout(seats)
                .build();
    }

    public Auditorium toAuditorium(AuditoriumDTO dto) {
        if (dto == null) return null;
        List<Seat> seats = dto.getSeatLayout() == null ? Collections.emptyList() :
                dto.getSeatLayout().stream().map(this::toSeat).collect(Collectors.toList());
        return Auditorium.builder()
                .id(dto.getId())
                .screenName(dto.getScreenName())
                .theatreId(dto.getTheatreId())
                .totalSeats(dto.getTotalSeats())
                .seatLayout(seats)
                .build();
    }
}
