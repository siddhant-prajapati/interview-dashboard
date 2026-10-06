package com.me.interview.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.me.interview.dashboard.enumeration.TopicCategory;
import lombok.Data;

import java.util.List;

@Data
public class PreparationTopicRequestDTO {
    private String name;
    private String description;
    private TopicCategory category;
    private Long parentId;

    @JsonAlias({"subTopics", "children"})
    @JsonProperty("children")
    private List<PreparationTopicRequestDTO> children;

    public List<PreparationTopicRequestDTO> getSubTopics() {
        return children;
    }

    public void setSubTopics(List<PreparationTopicRequestDTO> subTopics) {
        this.children = subTopics;
    }
}