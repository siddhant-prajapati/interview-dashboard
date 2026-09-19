package com.me.interview.dashboard.dto;

import com.me.interview.dashboard.enumeration.ProjectStatus;
import lombok.Data;

@Data
public class ProjectFilterDTO {
    private String name;
    private ProjectStatus status;
    private Long userId;
}