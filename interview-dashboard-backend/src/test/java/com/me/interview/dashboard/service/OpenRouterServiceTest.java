package com.me.interview.dashboard.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class OpenRouterServiceTest {

    @Test
    @DisplayName("OpenRouterService initializes successfully with empty builder optional")
    void testOpenRouterService_WithEmptyBuilder() {
        OpenRouterService service = new OpenRouterService(
                Optional.empty(),
                "https://openrouter.ai/api/v1/chat/completions",
                "test-key",
                "test-model"
        );

        assertThat(service).isNotNull();
    }

    @Test
    @DisplayName("OpenRouterService initializes successfully with provided builder")
    void testOpenRouterService_WithProvidedBuilder() {
        OpenRouterService service = new OpenRouterService(
                Optional.of(RestClient.builder()),
                "https://openrouter.ai/api/v1/chat/completions",
                "test-key",
                "test-model"
        );

        assertThat(service).isNotNull();
    }

    @Test
    @DisplayName("OpenRouterService convenience constructor initializes successfully")
    void testOpenRouterService_ConvenienceConstructor() {
        OpenRouterService service = new OpenRouterService(
                "https://openrouter.ai/api/v1/chat/completions",
                "test-key",
                "test-model"
        );

        assertThat(service).isNotNull();
    }
}
