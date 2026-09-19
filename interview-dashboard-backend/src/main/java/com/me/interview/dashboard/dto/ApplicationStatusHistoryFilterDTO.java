package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationStatusHistoryFilterDTO {
    private ApplicationStatus status;
    private Long jobApplicationId;
    private LocalDateTime changedAtStart;
    private LocalDateTime changedAtEnd;
}
