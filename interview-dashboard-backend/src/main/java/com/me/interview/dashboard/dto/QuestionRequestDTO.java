package com.me.interview.dashboard.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class QuestionRequestDTO {
    private String question;
    private LocalDate listedDate;

    // Relationship ID
    private Long technologyId;
}
