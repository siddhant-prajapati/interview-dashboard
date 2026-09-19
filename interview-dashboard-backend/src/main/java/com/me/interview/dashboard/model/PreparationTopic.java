package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.TopicCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TopicCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PreparationTopic parent;

    @OneToMany(mappedBy = "parent")
    private List<PreparationTopic> children = new ArrayList<>();
}