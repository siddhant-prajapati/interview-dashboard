package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ProjectStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private ProjectStatus status;
    private String githubUrl;
    private String liveUrl;
    private String about;
    private LocalDate createdDate;
    private LocalDate completionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long userId;
    // Assuming TechnologyResponseDTO exists; otherwise, this can be a list of IDs or basic objects.
    private List<TechnologyResponseDTO> technologies;
}