package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.CompanyFilterDTO;
import com.me.interview.dashboard.dto.CompanyRequestDTO;
import com.me.interview.dashboard.dto.CompanyResponseDTO;
import com.me.interview.dashboard.service.CompanyService;
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
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Company Management", description = "APIs for creating, updating, retrieving, and deleting companies")
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    @Operation(summary = "Create a new Company", description = "Adds a new company to the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Company successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<CompanyResponseDTO> createCompany(
            @RequestBody CompanyRequestDTO requestDTO) {
        CompanyResponseDTO createdCompany = companyService.createCompany(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCompany);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Company by ID", description = "Retrieves a specific company by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Company found"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    public ResponseEntity<CompanyResponseDTO> getCompanyById(
            @Parameter(description = "ID of the company to be retrieved", required = true)
            @PathVariable Long id) {
        CompanyResponseDTO company = companyService.getCompanyById(id);
        return ResponseEntity.ok(company);
    }

    @GetMapping
    @Operation(summary = "Get all Companies", description = "Retrieves a paginated list of companies. Supports dynamic filtering based on name, location, etc.")
    @ApiResponse(responseCode = "200", description = "List of companies retrieved successfully")
    public ResponseEntity<Page<CompanyResponseDTO>> getCompanies(
            @ModelAttribute CompanyFilterDTO filter,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {

        Page<CompanyResponseDTO> companies = companyService.getCompanies(filter, pageable);
        return ResponseEntity.ok(companies);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Company", description = "Updates a company's details by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Company updated successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @Parameter(description = "ID of the company to be updated", required = true)
            @PathVariable Long id,
            @RequestBody CompanyRequestDTO requestDTO) {
        CompanyResponseDTO updatedCompany = companyService.updateCompany(id, requestDTO);
        return ResponseEntity.ok(updatedCompany);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Company", description = "Deletes a company by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Company deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    public ResponseEntity<Void> deleteCompany(
            @Parameter(description = "ID of the company to be deleted", required = true)
            @PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}