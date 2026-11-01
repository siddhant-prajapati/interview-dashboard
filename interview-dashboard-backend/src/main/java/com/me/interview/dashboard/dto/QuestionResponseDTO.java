package com.me.interview.dashboard.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class QuestionResponseDTO {
    private Long id;
    private String question;
    private LocalDate listedDate;

    // Simplified relationship data
    private Long technologyId;
    private String technologyName;
    private List<Long> interviewIds;
}
