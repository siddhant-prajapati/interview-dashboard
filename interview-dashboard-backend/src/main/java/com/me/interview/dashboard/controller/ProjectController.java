package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.ProjectFilterDTO;
import com.me.interview.dashboard.dto.ProjectRequestDTO;
import com.me.interview.dashboard.dto.ProjectResponseDTO;
import com.me.interview.dashboard.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project Management", description = "APIs for managing application projects")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a new Project", description = "Creates a project and links it to a user and existing technologies.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Project created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload provided"),
            @ApiResponse(responseCode = "404", description = "Referenced User or Technology not found")
    })
    public ResponseEntity<ProjectResponseDTO> createProject(@RequestBody ProjectRequestDTO requestDTO) {
        ProjectResponseDTO response = projectService.createProject(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Project by ID", description = "Fetches a specific project based on its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Project retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping
    @Operation(summary = "Get all Projects", description = "Fetches a paginated list of projects with optional dynamic filtering by name, status, or userId.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of projects")
    public ResponseEntity<Page<ProjectResponseDTO>> getProjects(
            @ParameterObject ProjectFilterDTO filter,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(projectService.getProjects(filter, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Project", description = "Updates project details, status, and related relationships.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Project updated successfully"),
            @ApiResponse(responseCode = "404", description = "Project, User, or Technology not found")
    })
    public ResponseEntity<ProjectResponseDTO> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectRequestDTO requestDTO) {
        return ResponseEntity.ok(projectService.updateProject(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Project", description = "Permanently removes a project from the system by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Project deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}