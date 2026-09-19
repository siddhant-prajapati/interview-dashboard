package com.me.interview.dashboard.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "resume_name", nullable = false)
    private String resumeName;

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}