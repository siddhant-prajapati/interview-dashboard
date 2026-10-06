package com.me.interview.dashboard.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.me.interview.dashboard.enumeration.TopicCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "preparation_topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreparationTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private TopicCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PreparationTopic parent;

    @Builder.Default
    @OneToMany(mappedBy = "parent")
    @JsonAlias({"children", "subTopics"})
    @JsonProperty("children")
    private List<PreparationTopic> subTopics = new ArrayList<>();

    public List<PreparationTopic> getChildren() {
        return subTopics;
    }

    public void setChildren(List<PreparationTopic> children) {
        this.subTopics = children;
    }
}