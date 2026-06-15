package com.assignment.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${catalog-service.base-url:http://localhost:8081}")
    private String catalogServiceBaseUrl;

    @Bean
    public WebClient catalogWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(catalogServiceBaseUrl)
                .build();
    }
}
