package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TopicCategory;
import lombok.Data;

import java.util.List;

@Data
public class PreparationTopicRequestDTO {
    private String name;
    private String description;
    private TopicCategory category;
    private Long parentId;
    private List<PreparationTopicRequestDTO> subTopics;
}