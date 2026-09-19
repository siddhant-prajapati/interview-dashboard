package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.PreparationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserTopicProgressFilterDTO {
    private Long userId;
    private Long topicId;
    private PreparationStatus status;
    private LocalDate nextRevisionBefore;
}