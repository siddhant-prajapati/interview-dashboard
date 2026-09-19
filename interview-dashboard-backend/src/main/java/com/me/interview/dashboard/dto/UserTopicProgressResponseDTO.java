package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.PreparationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserTopicProgressResponseDTO {
    private Long id;
    private Long userId;
    private Long topicId;
    private Integer progressPercentage;
    private PreparationStatus status;
    private LocalDate startedAt;
    private LocalDate completedAt;
    private LocalDate lastRevisedAt;
    private LocalDate nextRevisionDate;
    private String notes;
}