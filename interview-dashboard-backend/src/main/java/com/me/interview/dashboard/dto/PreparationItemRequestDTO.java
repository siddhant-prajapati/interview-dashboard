package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ItemType;
import lombok.Data;

@Data
public class PreparationItemRequestDTO {
    private String title;
    private String description;
    private ItemType type;
    private Long topicId;
    private String externalUrl;
    private Integer difficulty;
    private Boolean completed;
    private String notes;
}