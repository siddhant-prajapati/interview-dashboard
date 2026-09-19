package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ItemType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PreparationItemResponseDTO {
    private Long id;
    private String title;
    private String description;
    private ItemType type;
    private Long topicId;
    private String externalUrl;
    private Integer difficulty;
    private Boolean completed;
    private LocalDate completedAt;
    private String notes;
}