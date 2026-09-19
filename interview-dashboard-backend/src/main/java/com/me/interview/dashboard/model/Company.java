package com.me.interview.dashboard.model;

import com.me.interview.dashboard.enumeration.JobType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "technology_test")
    private Boolean technologyTest;

    @Column(name = "work_on")
    private String workOn;

    // Note: A List of Enums requires @ElementCollection in JPA
    @ElementCollection(targetClass = JobType.class)
    @CollectionTable(name = "company_allowed_job_types", joinColumns = @JoinColumn(name = "company_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private List<JobType> allowedJobType;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "location")
    private String location;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}