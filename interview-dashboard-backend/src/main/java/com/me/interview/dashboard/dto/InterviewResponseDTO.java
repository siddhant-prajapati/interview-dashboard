package com.me.interview.dashboard.dto;


import com.me.interview.dashboard.enumeration.InterviewStage;
import com.me.interview.dashboard.enumeration.InterviewStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InterviewResponseDTO {
    private Long id;
    private LocalDateTime interviewDate;
    private InterviewStage stage;
    private InterviewStatus status;
    private String notes;

    // Simplified relationship data
    private Long jobApplicationId;
    private String companyName;
    private String role;
    private List<Long> questionIds;
    private List<Long> requiredImprovementIds;

    // Full nested objects for UI debrief and editing
    private List<QuestionResponseDTO> questions;
    private List<TechnologyResponseDTO> requiredImprovements;
}
