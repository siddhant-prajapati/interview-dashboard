package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.TopicCategory;
import lombok.Data;

import java.util.List;

@Data
public class PreparationTopicResponseDTO {
    private Long id;
    private String name;
    private String description;
    private TopicCategory category;
    private Long parentId;

    // Nested children to easily build category trees in the UI
    private List<PreparationTopicResponseDTO> children;
}