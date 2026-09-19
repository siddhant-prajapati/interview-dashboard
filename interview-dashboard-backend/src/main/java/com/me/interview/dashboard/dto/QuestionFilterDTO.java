package com.me.interview.dashboard.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class QuestionFilterDTO {
    private String question;
    private Long technologyId;
    private LocalDate listedDateStart;
    private LocalDate listedDateEnd;
}
