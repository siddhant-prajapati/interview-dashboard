package com.me.interview.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PromptResponseDTO(
        String subject,
        String body
) {
    public PromptResponseDTO(String body) {
        this(extractSubject(body), extractBody(body));
    }

    public static PromptResponseDTO fromText(String rawText, String defaultSubject) {
        if (rawText == null || rawText.isBlank()) {
            return new PromptResponseDTO(defaultSubject, "");
        }
        String subject = defaultSubject;
        StringBuilder bodyBuilder = new StringBuilder();
        boolean foundSubject = false;

        for (String line : rawText.split("\n")) {
            String trimmed = line.trim();
            if (!foundSubject && trimmed.toLowerCase().startsWith("subject:")) {
                subject = trimmed.replaceFirst("(?i)^subject:\\s*", "").replaceAll("^[*#_`]+|[*#_`]+$", "").trim();
                foundSubject = true;
                continue;
            }
            bodyBuilder.append(line).append("\n");
        }

        String body = bodyBuilder.toString().trim();
        if (body.isEmpty()) {
            body = rawText.trim();
        }

        return new PromptResponseDTO(subject, body);
    }

    private static String extractSubject(String text) {
        if (text == null || text.isBlank()) return "Skill Alignment & Preparation";
        for (String line : text.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.toLowerCase().startsWith("subject:")) {
                return trimmed.replaceFirst("(?i)^subject:\\s*", "").replaceAll("^[*#_`]+|[*#_`]+$", "").trim();
            }
        }
        return "Skill Alignment & Preparation";
    }

    private static String extractBody(String text) {
        if (text == null) return "";
        StringBuilder sb = new StringBuilder();
        boolean foundSubject = false;
        for (String line : text.split("\n")) {
            String trimmed = line.trim();
            if (!foundSubject && trimmed.toLowerCase().startsWith("subject:")) {
                foundSubject = true;
                continue;
            }
            sb.append(line).append("\n");
        }
        String body = sb.toString().trim();
        return body.isEmpty() ? text.trim() : body;
    }
}
