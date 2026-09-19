package com.me.interview.dashboard.controller;


import com.me.interview.dashboard.dto.InterviewFilterDTO;
import com.me.interview.dashboard.dto.InterviewRequestDTO;
import com.me.interview.dashboard.dto.InterviewResponseDTO;
import com.me.interview.dashboard.service.InterviewService;
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
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Tag(name = "Interview Management", description = "APIs for creating, updating, retrieving, and deleting interview schedules and records")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    @Operation(summary = "Schedule a new Interview", description = "Creates a new interview record linked to a specific job application.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Interview successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<InterviewResponseDTO> createInterview(
            @RequestBody InterviewRequestDTO requestDTO) {
        InterviewResponseDTO createdInterview = interviewService.createInterview(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInterview);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Interview by ID", description = "Retrieves a specific interview by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Interview found"),
            @ApiResponse(responseCode = "404", description = "Interview not found")
    })
    public ResponseEntity<InterviewResponseDTO> getInterviewById(
            @Parameter(description = "ID of the interview to be retrieved", required = true)
            @PathVariable Long id) {
        InterviewResponseDTO interview = interviewService.getInterviewById(id);
        return ResponseEntity.ok(interview);
    }

    @GetMapping
    @Operation(summary = "Get all Interviews", description = "Retrieves a paginated list of interviews. Supports dynamic filtering based on stage, status, date, and associated job application.")
    @ApiResponse(responseCode = "200", description = "List of interviews retrieved successfully")
    public ResponseEntity<Page<InterviewResponseDTO>> getInterviews(
            @ModelAttribute InterviewFilterDTO filter,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {

        Page<InterviewResponseDTO> interviews = interviewService.getInterviews(filter, pageable);
        return ResponseEntity.ok(interviews);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Interview", description = "Updates an interview's details, stage, status, or associated questions.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Interview updated successfully"),
            @ApiResponse(responseCode = "404", description = "Interview not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<InterviewResponseDTO> updateInterview(
            @Parameter(description = "ID of the interview to be updated", required = true)
            @PathVariable Long id,
            @RequestBody InterviewRequestDTO requestDTO) {
        InterviewResponseDTO updatedInterview = interviewService.updateInterview(id, requestDTO);
        return ResponseEntity.ok(updatedInterview);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an Interview", description = "Deletes an interview record by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Interview deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Interview not found")
    })
    public ResponseEntity<Void> deleteInterview(
            @Parameter(description = "ID of the interview to be deleted", required = true)
            @PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}