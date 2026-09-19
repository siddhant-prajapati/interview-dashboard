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
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private PreparationTopic topic;

    private Integer progressPercentage;

    @Enumerated(EnumType.STRING)
    private PreparationStatus status;

    private LocalDate startedAt;

    private LocalDate completedAt;

    private LocalDate lastRevisedAt;

    private LocalDate nextRevisionDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
