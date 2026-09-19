package com.me.interview.dashboard.dto;


import com.me.interview.dashboard.enumeration.ProjectStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectRequestDTO {
    private String name;
    private ProjectStatus status;
    private String githubUrl;
    private String liveUrl;
    private String about;
    private LocalDate createdDate;
    private LocalDate completionDate;
    private Long userId;
    private List<Long> technologyIds;
}