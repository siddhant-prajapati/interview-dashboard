package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.PreparationTopicFilterDTO;
import com.me.interview.dashboard.dto.PreparationTopicRequestDTO;
import com.me.interview.dashboard.dto.PreparationTopicResponseDTO;
import com.me.interview.dashboard.service.PreparationTopicService;
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
@RequestMapping("/api/preparation-topics")
@RequiredArgsConstructor
@Tag(name = "Preparation Topic Management", description = "APIs for managing hierarchical interview preparation topics and study guides")
public class PreparationTopicController {

    private final PreparationTopicService topicService;

    @PostMapping
    @Operation(summary = "Create a new Preparation Topic", description = "Creates a new topic. If parentId is provided, it links to the parent to form a tree structure.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Preparation Topic created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload provided"),
            @ApiResponse(responseCode = "404", description = "Referenced Parent Topic not found")
    })
    public ResponseEntity<PreparationTopicResponseDTO> createTopic(@RequestBody PreparationTopicRequestDTO requestDTO) {
        PreparationTopicResponseDTO response = topicService.createTopic(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Topic by ID", description = "Fetches a specific preparation topic and its child topics.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Topic retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Topic not found")
    })
    public ResponseEntity<PreparationTopicResponseDTO> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(topicService.getTopicById(id));
    }

    @GetMapping
    @Operation(summary = "Get all Topics", description = "Fetches a paginated list of topics. Use the 'isRoot=true' filter to get only top-level categories.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of topics")
    public ResponseEntity<Page<PreparationTopicResponseDTO>> getTopics(
            @ParameterObject PreparationTopicFilterDTO filter,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(topicService.getTopics(filter, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a Topic", description = "Updates topic details or changes its parent category.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Topic updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload (e.g., topic set as its own parent)"),
            @ApiResponse(responseCode = "404", description = "Topic or Parent Topic not found")
    })
    public ResponseEntity<PreparationTopicResponseDTO> updateTopic(
            @PathVariable Long id,
            @RequestBody PreparationTopicRequestDTO requestDTO) {
        return ResponseEntity.ok(topicService.updateTopic(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Topic", description = "Removes a topic. Deletion will be rejected if the topic still contains child nodes.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Topic deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Deletion blocked due to existing child topics"),
            @ApiResponse(responseCode = "404", description = "Topic not found")
    })
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }
}