package com.assignment.booking.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Decode payload part of the JWT
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
                    JsonNode claims = objectMapper.readTree(payloadJson);

                    String userId = claims.has("sub") ? claims.get("sub").asText() : null;
                    
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    if (claims.has("roles")) {
                        claims.get("roles").forEach(role -> {
                            String roleName = role.asText();
                            if (!roleName.startsWith("ROLE_")) {
                                roleName = "ROLE_" + roleName;
                            }
                            authorities.add(new SimpleGrantedAuthority(roleName));
                        });
                    }

                    if (userId != null) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userId, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("Successfully authenticated user: {} with roles: {}", userId, authorities);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to parse JWT token: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
