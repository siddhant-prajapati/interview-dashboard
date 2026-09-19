package com.me.interview.dashboard.service.impl;

import com.me.interview.dashboard.dto.ProjectFilterDTO;
import com.me.interview.dashboard.dto.ProjectRequestDTO;
import com.me.interview.dashboard.dto.ProjectResponseDTO;
import com.me.interview.dashboard.model.Project;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.exception.ResourceNotFoundException;
import com.me.interview.dashboard.mapper.ProjectMapper;
import com.me.interview.dashboard.repository.ProjectRepository;
import com.me.interview.dashboard.repository.TechnologyRepository;
import com.me.interview.dashboard.repository.UserRepository;
import com.me.interview.dashboard.service.ProjectService;
import com.me.interview.dashboard.specification.ProjectSpecifications;
import com.me.interview.dashboard.util.CustomLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TechnologyRepository technologyRepository;
    private final ProjectMapper projectMapper;

    private final CustomLogger logger = CustomLogger.getInstance();

    @Override
    @Transactional
    public ProjectResponseDTO createProject(ProjectRequestDTO requestDTO) {
        logger.info("Attempting to create a new Project: " + requestDTO.getName());

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        List<Technology> technologies = resolveTechnologies(requestDTO.getTechnologyIds());

        try {
            Project project = projectMapper.toEntity(requestDTO);
            project.setUser(user);
            project.setTechnologies(technologies);
            project.setCreatedAt(LocalDateTime.now());

            Project savedProject = projectRepository.save(project);
            logger.info("Successfully created Project with ID: " + savedProject.getId());
            return projectMapper.toDto(savedProject);
        } catch (Exception e) {
            logger.error("Failed to create Project: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponseDTO getProjectById(Long id) {
        logger.info("Fetching Project with ID: " + id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return projectMapper.toDto(project);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectResponseDTO> getProjects(ProjectFilterDTO filter, Pageable pageable) {
        logger.info("Fetching paginated list of Projects with filters applied");
        Specification<Project> spec = ProjectSpecifications.buildSpecification(filter);
        return projectRepository.findAll(spec, pageable).map(projectMapper::toDto);
    }

    @Override
    @Transactional
    public ProjectResponseDTO updateProject(Long id, ProjectRequestDTO requestDTO) {
        logger.info("Attempting to update Project with ID: " + id);

        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDTO.getUserId()));

        List<Technology> technologies = resolveTechnologies(requestDTO.getTechnologyIds());

        try {
            projectMapper.updateEntityFromDto(requestDTO, existingProject);
            existingProject.setUser(user);
            existingProject.setTechnologies(technologies);
            existingProject.setUpdatedAt(LocalDateTime.now());

            Project updatedProject = projectRepository.save(existingProject);
            logger.info("Successfully updated Project with ID: " + id);
            return projectMapper.toDto(updatedProject);
        } catch (Exception e) {
            logger.error("Failed to update Project with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        logger.info("Attempting to delete Project with ID: " + id);

        if (!projectRepository.existsById(id)) {
            logger.warn("Deletion failed: Project not found with ID: " + id);
            throw new ResourceNotFoundException("Project", "id", id);
        }

        try {
            projectRepository.deleteById(id);
            logger.info("Successfully deleted Project with ID: " + id);
        } catch (Exception e) {
            logger.error("Failed to delete Project with ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    private List<Technology> resolveTechnologies(List<Long> technologyIds) {
        if (technologyIds == null || technologyIds.isEmpty()) {
            return new ArrayList<>();
        }
        return technologyRepository.findAllById(technologyIds);
    }
}