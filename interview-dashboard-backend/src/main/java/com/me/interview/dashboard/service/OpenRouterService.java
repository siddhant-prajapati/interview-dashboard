package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.OpenRouterRequest;
import com.me.interview.dashboard.dto.OpenRouterResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

@Service
public class OpenRouterService {

    private final RestClient restClient;
    private final String model;

    @Autowired
    public OpenRouterService(
            Optional<RestClient.Builder> restClientBuilder,
            @Value("${openrouter.api-url}") String apiUrl,
            @Value("${openrouter.api-key}") String apiKey,
            @Value("${openrouter.model}") String model) {
        
        this.model = model;
        RestClient.Builder builder = restClientBuilder.orElseGet(RestClient::builder);
        this.restClient = builder
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                // Optional: OpenRouter headers for rankings
                .defaultHeader("HTTP-Referer", "http://localhost:8080")
                .defaultHeader("X-Title", "Interview Command Center")
                .build();
    }

    public OpenRouterService(
            String apiUrl,
            String apiKey,
            String model) {
        this(Optional.of(RestClient.builder()), apiUrl, apiKey, model);
    }

    public String generateEmailFromPrompt(String prompt) {
        OpenRouterRequest request = new OpenRouterRequest(
                model,
                List.of(new OpenRouterRequest.Message("user", prompt))
        );

        OpenRouterResponse response = restClient.post()
                .body(request)
                .retrieve()
                .body(OpenRouterResponse.class);

        if (response != null && response.choices() != null && !response.choices().isEmpty()) {
            return response.choices().get(0).message().content();
        }
        
        throw new RuntimeException("Failed to generate response from OpenRouter");
    }
}