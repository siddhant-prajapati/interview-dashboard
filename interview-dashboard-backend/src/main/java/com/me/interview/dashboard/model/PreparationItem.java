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
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ItemType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private PreparationTopic topic;

    private String externalUrl;

    private Integer difficulty;

    private Boolean completed;

    private LocalDate completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}