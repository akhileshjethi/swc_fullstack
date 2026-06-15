package com.assignment.catalog.repository;

import com.assignment.catalog.entity.Theatre;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheatreRepository extends MongoRepository<Theatre, String> {
    boolean existsByLocationId(String locationId);
    List<Theatre> findByLocationId(String locationId);
}
