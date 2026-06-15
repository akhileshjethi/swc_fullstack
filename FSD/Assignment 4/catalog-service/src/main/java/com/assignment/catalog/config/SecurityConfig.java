package com.assignment.catalog.config;

import com.assignment.catalog.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow public access to actuator endpoints or other health checks if needed
                .requestMatchers("/actuator/**").permitAll()
                // GET requests for Catalog items are allowed for USER, THEATRE_OWNER, ADMIN (essentially all authenticated users)
                .requestMatchers(HttpMethod.GET, "/movies/**", "/theatres/**", "/locations/**", "/auditoriums/**").hasAnyAuthority("ROLE_USER", "ROLE_THEATRE_OWNER", "ROLE_ADMIN")
                // Location CRUD (POST, PUT, DELETE) is ADMIN only
                .requestMatchers(HttpMethod.POST, "/locations/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/locations/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/locations/**").hasAuthority("ROLE_ADMIN")
                // Movie, Theatre, Auditorium CRUD are for THEATRE_OWNER and ADMIN
                .requestMatchers(HttpMethod.POST, "/movies/**", "/theatres/**", "/auditoriums/**").hasAnyAuthority("ROLE_THEATRE_OWNER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/movies/**", "/theatres/**", "/auditoriums/**").hasAnyAuthority("ROLE_THEATRE_OWNER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/movies/**", "/theatres/**", "/auditoriums/**").hasAnyAuthority("ROLE_THEATRE_OWNER", "ROLE_ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
