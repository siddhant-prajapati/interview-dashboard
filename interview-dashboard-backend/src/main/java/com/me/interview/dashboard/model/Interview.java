package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.InterviewStage;
import com.me.interview.dashboard.enumeration.InterviewStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "interview_date")
    private LocalDateTime interviewDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", length = 50)
    private InterviewStage stage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private InterviewStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @ManyToMany
    @JoinTable(
            name = "interview_questions",
            joinColumns = @JoinColumn(name = "interview_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private List<Question> questions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "interview_required_improvement",
            joinColumns = @JoinColumn(name = "interview_id"),
            inverseJoinColumns = @JoinColumn(name = "technology_id")
    )
    private List<Technology> requiredImprovements = new ArrayList<>();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}