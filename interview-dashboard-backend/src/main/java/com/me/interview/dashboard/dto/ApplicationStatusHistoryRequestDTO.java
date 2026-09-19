package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationStatusHistoryRequestDTO {
    private ApplicationStatus status;
    private LocalDateTime changedAt;
    private String notes;

    // Relationship ID
    private Long jobApplicationId;
}
