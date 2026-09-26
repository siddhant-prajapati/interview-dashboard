package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.ItemType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "preparation_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreparationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private ItemType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private PreparationTopic topic;

    @Column(name = "external_url")
    private String externalUrl;

    @Column(name = "difficulty")
    private Integer difficulty;

    @Column(name = "completed")
    private Boolean completed;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}