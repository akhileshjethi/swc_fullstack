package com.assignment.catalog.repository;

import com.assignment.catalog.entity.Auditorium;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriumRepository extends MongoRepository<Auditorium, String> {
    boolean existsByTheatreId(String theatreId);
    List<Auditorium> findByTheatreId(String theatreId);
}
