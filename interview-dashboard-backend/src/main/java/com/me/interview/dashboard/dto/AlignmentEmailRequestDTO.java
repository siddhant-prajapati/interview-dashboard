package com.me.interview.dashboard.dto;

public record AlignmentEmailRequestDTO(
        Long userId,
        Long jobApplicationId,
        String role,
        String company,
        String technologies,
        String jdText
) {}
