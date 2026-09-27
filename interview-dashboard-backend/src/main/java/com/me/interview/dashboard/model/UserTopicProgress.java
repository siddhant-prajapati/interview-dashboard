package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.PreparationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "user_topic_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private PreparationTopic topic;

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private PreparationStatus status;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "last_revised_at")
    private LocalDate lastRevisedAt;

    @Column(name = "next_revision_date")
    private LocalDate nextRevisionDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
