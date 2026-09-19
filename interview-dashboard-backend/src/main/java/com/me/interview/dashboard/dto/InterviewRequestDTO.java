package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.InterviewStage;
import com.me.interview.dashboard.enumeration.InterviewStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InterviewRequestDTO {
    private LocalDateTime interviewDate;
    private InterviewStage stage;
    private InterviewStatus status;
    private String notes;

    // Relationship IDs
    private Long jobApplicationId;
    private List<Long> questionIds;
    private List<Long> requiredImprovementIds;
}