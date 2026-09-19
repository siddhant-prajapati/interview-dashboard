package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.ApplicationStatus;
import com.me.interview.dashboard.enumeration.JobType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "platform")
    private String platform;

    @Column(name = "posting_date")
    private LocalDate postingDate;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "role")
    private String role;

    @Column(name = "experience")
    private Double experience;

    @Column(name = "expected_salary")
    private String expectedSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", length = 50)
    private JobType jobType;

    @Column(name = "apply_date")
    private LocalDate applyDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private ApplicationStatus status;

    @Column(name = "follow_up_count")
    private Integer followUpCount;

    @Column(name = "portfolio_shared")
    private Boolean portfolioShared;

    @Column(name = "linkedin_profile_shared")
    private Boolean linkedInProfileShared;

    @Column(name = "job_url")
    private String jobUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @ManyToMany
    @JoinTable(
            name = "job_application_technology",
            joinColumns = @JoinColumn(name = "job_application_id"),
            inverseJoinColumns = @JoinColumn(name = "technology_id")
    )
    private List<Technology> technologies = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}