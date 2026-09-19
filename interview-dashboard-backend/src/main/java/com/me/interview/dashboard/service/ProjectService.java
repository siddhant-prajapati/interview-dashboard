package com.me.interview.dashboard.service;

import com.me.interview.dashboard.dto.ProjectFilterDTO;
import com.me.interview.dashboard.dto.ProjectRequestDTO;
import com.me.interview.dashboard.dto.ProjectResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {
    ProjectResponseDTO createProject(ProjectRequestDTO requestDTO);
    ProjectResponseDTO getProjectById(Long id);
    Page<ProjectResponseDTO> getProjects(ProjectFilterDTO filter, Pageable pageable);
    ProjectResponseDTO updateProject(Long id, ProjectRequestDTO requestDTO);
    void deleteProject(Long id);
}