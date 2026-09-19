package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.PreparationItemFilterDTO;
import com.me.interview.dashboard.dto.PreparationItemRequestDTO;
import com.me.interview.dashboard.dto.PreparationItemResponseDTO;
import com.me.interview.dashboard.service.PreparationItemService;
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
@RequestMapping("/api/preparation-items")
@RequiredArgsConstructor
@Tag(name = "Preparation Item Management", description = "APIs for managing individual tasks, questions, or resources tied to a preparation topic")
public class PreparationItemController {

    private final PreparationItemService itemService;

    @PostMapping
    @Operation(summary = "Create a new Preparation Item", description = "Creates a new item and links it to an existing preparation topic.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Preparation Item created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload provided"),
            @ApiResponse(responseCode = "404", description = "Referenced Preparation Topic not found")
    })
    public ResponseEntity<PreparationItemResponseDTO> createItem(@RequestBody PreparationItemRequestDTO requestDTO) {
        PreparationItemResponseDTO response = itemService.createItem(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Item by ID", description = "Fetches a specific preparation item by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    public ResponseEntity<PreparationItemResponseDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @GetMapping
    @Operation(summary = "Get all Items", description = "Fetches a paginated list of items with optional dynamic filtering by topicId, difficulty, or completion status.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of items")
    public ResponseEntity<Page<PreparationItemResponseDTO>> getItems(
            @ParameterObject PreparationItemFilterDTO filter,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(itemService.getItems(filter, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an Item", description = "Updates item details. Automatically sets completion date if marked as completed.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item updated successfully"),
            @ApiResponse(responseCode = "404", description = "Item or Preparation Topic not found")
    })
    public ResponseEntity<PreparationItemResponseDTO> updateItem(
            @PathVariable Long id,
            @RequestBody PreparationItemRequestDTO requestDTO) {
        return ResponseEntity.ok(itemService.updateItem(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an Item", description = "Removes a preparation item permanently from the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Item deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}