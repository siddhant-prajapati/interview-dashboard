package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationStatusHistoryResponseDTO {
    private Long id;
    private ApplicationStatus status;
    private LocalDateTime changedAt;
    private String notes;

    // Simplified relationship data
    private Long jobApplicationId;
}
