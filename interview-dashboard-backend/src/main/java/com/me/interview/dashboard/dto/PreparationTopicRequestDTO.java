package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TopicCategory;
import lombok.Data;

@Data
public class PreparationTopicRequestDTO {
    private String name;
    private String description;
    private TopicCategory category;
    private Long parentId; // ID of the parent topic (null if it's a root topic)
}