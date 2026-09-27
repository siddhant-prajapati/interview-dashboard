package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.PlatformFilterDTO;
import com.me.interview.dashboard.dto.PlatformRequestDTO;
import com.me.interview.dashboard.dto.PlatformResponseDTO;
import com.me.interview.dashboard.service.PlatformService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platforms")
@RequiredArgsConstructor
@Tag(name = "Platform Management", description = "APIs for managing job search and networking platforms")
public class PlatformController {

    private final PlatformService platformService;

    @PostMapping
    @Operation(summary = "Create a new Platform", description = "Creates a platform and links it to a user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Platform created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload provided"),
            @ApiResponse(responseCode = "404", description = "Referenced User not found")
    })
    public ResponseEntity<PlatformResponseDTO> createPlatform(@RequestBody PlatformRequestDTO requestDTO) {
        PlatformResponseDTO response = platformService.createPlatform(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk create Platforms", description = "Inserts multiple platforms into the system in a single request.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Platforms successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<List<PlatformResponseDTO>> createPlatformsBulk(@RequestBody List<PlatformRequestDTO> requestDTOs) {
        List<PlatformResponseDTO> response = platformService.createPlatformsBulk(requestDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Platform by ID", description = "Fetches a specific platform based on its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Platform retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Platform not found")
    })
    public ResponseEntity<PlatformResponseDTO> getPlatformById(
            @Parameter(description = "ID of the platform to retrieve", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(platformService.getPlatformById(id));
    }

    @GetMapping
    @Operation(summary = "Get all Platforms", description = "Fetches a paginated list of platforms with optional dynamic filtering by name or userId.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of platforms")
    public ResponseEntity<Page<PlatformResponseDTO>> getPlatforms(
            @ParameterObject @ModelAttribute PlatformFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sort) {

        Sort.Direction direction = "desc".equalsIgnoreCase(sort) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(platformService.getPlatforms(filter, pageable));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get Platforms by User ID", description = "Fetches all platforms associated with a specific user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Platforms retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<PlatformResponseDTO>> getPlatformsByUserId(
            @Parameter(description = "ID of the user", required = true)
            @PathVariable Long userId) {
        return ResponseEntity.ok(platformService.getPlatformsByUserId(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Platform", description = "Updates platform details, job post count, and associated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Platform updated successfully"),
            @ApiResponse(responseCode = "404", description = "Platform or User not found")
    })
    public ResponseEntity<PlatformResponseDTO> updatePlatform(
            @Parameter(description = "ID of the platform to update", required = true)
            @PathVariable Long id,
            @RequestBody PlatformRequestDTO requestDTO) {
        return ResponseEntity.ok(platformService.updatePlatform(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Platform", description = "Permanently removes a platform from the system by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Platform deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Platform not found")
    })
    public ResponseEntity<Void> deletePlatform(
            @Parameter(description = "ID of the platform to delete", required = true)
            @PathVariable Long id) {
        platformService.deletePlatform(id);
        return ResponseEntity.noContent().build();
    }
}
