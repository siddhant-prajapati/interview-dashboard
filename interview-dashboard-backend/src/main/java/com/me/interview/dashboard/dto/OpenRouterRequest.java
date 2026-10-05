package com.me.interview.dashboard.dto.openrouter;

import java.util.List;

public record OpenRouterRequest(
        String model,
        List<Message> messages
) {
    public record Message(String role, String content) {}
}