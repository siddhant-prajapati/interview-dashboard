package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ItemType;
import lombok.Data;

@Data
public class PreparationItemFilterDTO {
    private String title;
    private ItemType type;
    private Long topicId;
    private Integer difficulty;
    private Boolean completed;
}