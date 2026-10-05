package com.me.interview.dashboard.dto.openrouter;

import java.util.List;

public record OpenRouterResponse(
        List<Choice> choices
) {
    public record Choice(Message message) {}
    public record Message(String content) {}
}