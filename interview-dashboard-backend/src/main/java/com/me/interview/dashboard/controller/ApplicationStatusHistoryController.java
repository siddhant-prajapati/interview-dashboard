package com.me.interview.dashboard.controller;


import com.me.interview.dashboard.dto.ApplicationStatusHistoryFilterDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryRequestDTO;
import com.me.interview.dashboard.dto.ApplicationStatusHistoryResponseDTO;
import com.me.interview.dashboard.service.ApplicationStatusHistoryService;
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
@RequestMapping("/api/application-status-histories")
@RequiredArgsConstructor
@Tag(name = "Application Status History Management", description = "APIs for tracking and managing the history of status changes for job applications")
public class ApplicationStatusHistoryController {

    private final ApplicationStatusHistoryService applicationStatusHistoryService;

    @PostMapping
    @Operation(summary = "Create a new Status History Record", description = "Logs a new status change for a specific job application.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Status history successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<ApplicationStatusHistoryResponseDTO> createApplicationStatusHistory(
            @RequestBody ApplicationStatusHistoryRequestDTO requestDTO) {
        ApplicationStatusHistoryResponseDTO createdHistory = applicationStatusHistoryService.createApplicationStatusHistory(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHistory);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Status History by ID", description = "Retrieves a specific status history record by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status history found"),
            @ApiResponse(responseCode = "404", description = "Status history not found")
    })
    public ResponseEntity<ApplicationStatusHistoryResponseDTO> getApplicationStatusHistoryById(
            @Parameter(description = "ID of the status history record to be retrieved", required = true)
            @PathVariable Long id) {
        ApplicationStatusHistoryResponseDTO history = applicationStatusHistoryService.getApplicationStatusHistoryById(id);
        return ResponseEntity.ok(history);
    }

    @GetMapping
    @Operation(summary = "Get all Status Histories", description = "Retrieves a paginated list of status history records. Supports dynamic filtering based on status, associated job application, and date range.")
    @ApiResponse(responseCode = "200", description = "List of status histories retrieved successfully")
    public ResponseEntity<Page<ApplicationStatusHistoryResponseDTO>> getApplicationStatusHistories(
            @ModelAttribute ApplicationStatusHistoryFilterDTO filter,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {

        Page<ApplicationStatusHistoryResponseDTO> histories = applicationStatusHistoryService.getApplicationStatusHistories(filter, pageable);
        return ResponseEntity.ok(histories);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Status History Record", description = "Updates the details (like notes or changed date) of a specific status history record.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status history updated successfully"),
            @ApiResponse(responseCode = "404", description = "Status history not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<ApplicationStatusHistoryResponseDTO> updateApplicationStatusHistory(
            @Parameter(description = "ID of the status history record to be updated", required = true)
            @PathVariable Long id,
            @RequestBody ApplicationStatusHistoryRequestDTO requestDTO) {
        ApplicationStatusHistoryResponseDTO updatedHistory = applicationStatusHistoryService.updateApplicationStatusHistory(id, requestDTO);
        return ResponseEntity.ok(updatedHistory);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Status History Record", description = "Deletes a specific status history record by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Status history deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Status history not found")
    })
    public ResponseEntity<Void> deleteApplicationStatusHistory(
            @Parameter(description = "ID of the status history record to be deleted", required = true)
            @PathVariable Long id) {
        applicationStatusHistoryService.deleteApplicationStatusHistory(id);
        return ResponseEntity.noContent().build();
    }
}
