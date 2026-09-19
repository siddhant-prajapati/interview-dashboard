package com.me.interview.dashboard.dto;


import com.me.interview.dashboard.enumeration.InterviewStage;
import com.me.interview.dashboard.enumeration.InterviewStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewFilterDTO {
    private InterviewStage stage;
    private InterviewStatus status;
    private Long jobApplicationId;
    private LocalDateTime interviewDateStart;
    private LocalDateTime interviewDateEnd;
}