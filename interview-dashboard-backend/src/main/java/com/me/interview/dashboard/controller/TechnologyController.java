package com.me.interview.dashboard.controller;


import com.me.interview.dashboard.dto.TechnologyFilterDTO;
import com.me.interview.dashboard.dto.TechnologyRequestDTO;
import com.me.interview.dashboard.dto.TechnologyResponseDTO;
import com.me.interview.dashboard.service.TechnologyService;
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
@RequestMapping("/api/technologies")
@RequiredArgsConstructor
@Tag(name = "Technology Management", description = "APIs for creating, updating, retrieving, and deleting technologies")
public class TechnologyController {

    private final TechnologyService technologyService;

    @PostMapping
    @Operation(summary = "Create a new Technology", description = "Adds a new technology (e.g., Java, React, SQL) to the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Technology successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<TechnologyResponseDTO> createTechnology(
            @RequestBody TechnologyRequestDTO requestDTO) {
        TechnologyResponseDTO createdTechnology = technologyService.createTechnology(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTechnology);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk create Technologies", description = "Inserts multiple technologies into the system in a single request.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Technologies successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<List<TechnologyResponseDTO>> createTechnologiesBulk(
            @RequestBody List<TechnologyRequestDTO> requestDTOs) {
        List<TechnologyResponseDTO> createdTechnologies = technologyService.createTechnologiesBulk(requestDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTechnologies);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Technology by ID", description = "Retrieves a specific technology by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Technology found"),
            @ApiResponse(responseCode = "404", description = "Technology not found")
    })
    public ResponseEntity<TechnologyResponseDTO> getTechnologyById(
            @Parameter(description = "ID of the technology to be retrieved", required = true)
            @PathVariable Long id) {
        TechnologyResponseDTO technology = technologyService.getTechnologyById(id);
        return ResponseEntity.ok(technology);
    }

    @GetMapping
    @Operation(summary = "Get all Technologies", description = "Retrieves a paginated list of technologies. Supports dynamic filtering based on name and technology type.")
    @ApiResponse(responseCode = "200", description = "List of technologies retrieved successfully")
    public ResponseEntity<Page<TechnologyResponseDTO>> getTechnologies(
            @ParameterObject @ModelAttribute TechnologyFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sort) {

        Sort.Direction direction = "desc".equalsIgnoreCase(sort) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<TechnologyResponseDTO> technologies = technologyService.getTechnologies(filter, pageable);
        return ResponseEntity.ok(technologies);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Technology", description = "Updates a technology's details by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Technology updated successfully"),
            @ApiResponse(responseCode = "404", description = "Technology not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<TechnologyResponseDTO> updateTechnology(
            @Parameter(description = "ID of the technology to be updated", required = true)
            @PathVariable Long id,
            @RequestBody TechnologyRequestDTO requestDTO) {
        TechnologyResponseDTO updatedTechnology = technologyService.updateTechnology(id, requestDTO);
        return ResponseEntity.ok(updatedTechnology);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Technology", description = "Deletes a technology by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Technology deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Technology not found")
    })
    public ResponseEntity<Void> deleteTechnology(
            @Parameter(description = "ID of the technology to be deleted", required = true)
            @PathVariable Long id) {
        technologyService.deleteTechnology(id);
        return ResponseEntity.noContent().build();
    }
}