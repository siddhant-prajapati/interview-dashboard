package com.me.interview.dashboard.controller;


import com.me.interview.dashboard.dto.JobApplicationCompositeRequestDTO;
import com.me.interview.dashboard.dto.JobApplicationFilterDTO;
import com.me.interview.dashboard.dto.JobApplicationRequestDTO;
import com.me.interview.dashboard.dto.JobApplicationResponseDTO;
import com.me.interview.dashboard.service.JobApplicationService;
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
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
@Tag(name = "Job Application Management", description = "APIs for creating, updating, retrieving, and deleting job applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping
    @Operation(summary = "Create a new Job Application", description = "Creates a new job application and links it to existing company, resume, and technologies via their IDs.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Job Application successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<JobApplicationResponseDTO> createJobApplication(
            @RequestBody JobApplicationRequestDTO requestDTO) {
        JobApplicationResponseDTO createdApplication = jobApplicationService.createJobApplication(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    @PostMapping("/composite")
    @Operation(
            summary = "Create Job Application with Nested Sub-Entities",
            description = "Creates an application along with dynamic linking or creation of Company, Resume, and Technologies, plus an automatic initial status history entry."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Application and dependencies created/linked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload provided"),
            @ApiResponse(responseCode = "404", description = "Referenced existing sub-entity ID not found")
    })
    public ResponseEntity<JobApplicationResponseDTO> createCompositeJobApplication(
            @RequestBody JobApplicationCompositeRequestDTO requestDTO) {
        JobApplicationResponseDTO response = jobApplicationService.createCompositeJobApplication(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Job Application by ID", description = "Retrieves a specific job application by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Job Application found"),
            @ApiResponse(responseCode = "404", description = "Job Application not found")
    })
    public ResponseEntity<JobApplicationResponseDTO> getJobApplicationById(
            @Parameter(description = "ID of the job application to be retrieved", required = true)
            @PathVariable Long id) {
        JobApplicationResponseDTO application = jobApplicationService.getJobApplicationById(id);
        return ResponseEntity.ok(application);
    }

    @GetMapping
    @Operation(summary = "Get all Job Applications", description = "Retrieves a paginated list of job applications. Supports dynamic filtering based on platform, role, status, etc.")
    @ApiResponse(responseCode = "200", description = "List of job applications retrieved successfully")
    public ResponseEntity<Page<JobApplicationResponseDTO>> getJobApplications(
            @ModelAttribute JobApplicationFilterDTO filter,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {

        Page<JobApplicationResponseDTO> applications = jobApplicationService.getJobApplications(filter, pageable);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Job Application", description = "Updates a job application by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Job Application updated successfully"),
            @ApiResponse(responseCode = "404", description = "Job Application not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<JobApplicationResponseDTO> updateJobApplication(
            @Parameter(description = "ID of the job application to be updated", required = true)
            @PathVariable Long id,
            @RequestBody JobApplicationRequestDTO requestDTO) {
        JobApplicationResponseDTO updatedApplication = jobApplicationService.updateJobApplication(id, requestDTO);
        return ResponseEntity.ok(updatedApplication);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Job Application", description = "Deletes a job application by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Job Application deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Job Application not found")
    })
    public ResponseEntity<Void> deleteJobApplication(
            @Parameter(description = "ID of the job application to be deleted", required = true)
            @PathVariable Long id) {
        jobApplicationService.deleteJobApplication(id);
        return ResponseEntity.noContent().build();
    }
}
