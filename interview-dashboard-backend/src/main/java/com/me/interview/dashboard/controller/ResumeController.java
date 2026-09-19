package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.ResumeFilterDTO;
import com.me.interview.dashboard.dto.ResumeRequestDTO;
import com.me.interview.dashboard.dto.ResumeResponseDTO;
import com.me.interview.dashboard.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume Management", description = "APIs for creating, updating, retrieving, and deleting resumes")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping
    @Operation(summary = "Create a new Resume record", description = "Adds a new resume metadata record to the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Resume successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<ResumeResponseDTO> createResume(
            @RequestBody ResumeRequestDTO requestDTO) {
        ResumeResponseDTO createdResume = resumeService.createResume(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdResume);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Resume by ID", description = "Retrieves a specific resume by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resume found"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    public ResponseEntity<ResumeResponseDTO> getResumeById(
            @Parameter(description = "ID of the resume to be retrieved", required = true)
            @PathVariable Long id) {
        ResumeResponseDTO resume = resumeService.getResumeById(id);
        return ResponseEntity.ok(resume);
    }

    @GetMapping
    @Operation(summary = "Get all Resumes", description = "Retrieves a paginated list of resumes. Supports dynamic filtering based on resume name.")
    @ApiResponse(responseCode = "200", description = "List of resumes retrieved successfully")
    public ResponseEntity<Page<ResumeResponseDTO>> getResumes(
            @ModelAttribute ResumeFilterDTO filter,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {

        Page<ResumeResponseDTO> resumes = resumeService.getResumes(filter, pageable);
        return ResponseEntity.ok(resumes);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Resume", description = "Updates a resume's details (like name or document path) by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resume updated successfully"),
            @ApiResponse(responseCode = "404", description = "Resume not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<ResumeResponseDTO> updateResume(
            @Parameter(description = "ID of the resume to be updated", required = true)
            @PathVariable Long id,
            @RequestBody ResumeRequestDTO requestDTO) {
        ResumeResponseDTO updatedResume = resumeService.updateResume(id, requestDTO);
        return ResponseEntity.ok(updatedResume);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Resume", description = "Deletes a resume record by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Resume deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    public ResponseEntity<Void> deleteResume(
            @Parameter(description = "ID of the resume to be deleted", required = true)
            @PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }
}