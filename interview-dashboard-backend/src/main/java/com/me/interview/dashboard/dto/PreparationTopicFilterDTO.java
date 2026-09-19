package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TopicCategory;
import lombok.Data;

@Data
public class PreparationTopicFilterDTO {
    private String name;
    private TopicCategory category;
    private Long parentId;
    private Boolean isRoot; // To fetch only top-level topics (where parent is null)
}