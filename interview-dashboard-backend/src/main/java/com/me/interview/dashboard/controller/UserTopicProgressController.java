package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.UserTopicProgressFilterDTO;
import com.me.interview.dashboard.dto.UserTopicProgressRequestDTO;
import com.me.interview.dashboard.dto.UserTopicProgressResponseDTO;
import com.me.interview.dashboard.service.UserTopicProgressService;
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
@RequestMapping("/api/user-topic-progress")
@RequiredArgsConstructor
@Tag(name = "User Topic Progress Management", description = "APIs for tracking a user's progress and revision schedule for preparation topics")
public class UserTopicProgressController {

    private final UserTopicProgressService progressService;

    @PostMapping
    @Operation(summary = "Create a Progress Record", description = "Creates a new progress tracking record linking a user to a specific preparation topic.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Progress record created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload or record already exists for user and topic"),
            @ApiResponse(responseCode = "404", description = "Referenced User or Topic not found")
    })
    public ResponseEntity<UserTopicProgressResponseDTO> createProgress(@RequestBody UserTopicProgressRequestDTO requestDTO) {
        UserTopicProgressResponseDTO response = progressService.createProgress(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Progress by ID", description = "Fetches a specific progress record by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Progress retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Progress record not found")
    })
    public ResponseEntity<UserTopicProgressResponseDTO> getProgressById(@PathVariable Long id) {
        return ResponseEntity.ok(progressService.getProgressById(id));
    }

    @GetMapping
    @Operation(summary = "Get all Progress Records", description = "Fetches a paginated list of progress records with optional filtering by user, topic, status, and revision dates.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of progress records")
    public ResponseEntity<Page<UserTopicProgressResponseDTO>> getAllProgress(
            @ParameterObject UserTopicProgressFilterDTO filter,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(progressService.getAllProgress(filter, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a Progress Record", description = "Updates progress percentage, status, revision dates, or notes for a specific tracking record.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Progress record updated successfully"),
            @ApiResponse(responseCode = "404", description = "Progress record, User, or Topic not found")
    })
    public ResponseEntity<UserTopicProgressResponseDTO> updateProgress(
            @PathVariable Long id,
            @RequestBody UserTopicProgressRequestDTO requestDTO) {
        return ResponseEntity.ok(progressService.updateProgress(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Progress Record", description = "Removes a progress tracking record permanently from the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Progress record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Progress record not found")
    })
    public ResponseEntity<Void> deleteProgress(@PathVariable Long id) {
        progressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }
}