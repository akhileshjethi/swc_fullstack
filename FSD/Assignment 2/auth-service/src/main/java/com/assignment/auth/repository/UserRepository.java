package com.assignment.auth.repository;

import com.assignment.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for database operations on the User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email.
     *
     * @param email the email of the user
     * @return an Optional containing the found user, or empty
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given email.
     *
     * @param email the email to check
     * @return true if a user exists, false otherwise
     */
    Boolean existsByEmail(String email);
}
