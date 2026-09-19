package com.me.interview.dashboard.controller;


import com.me.interview.dashboard.dto.QuestionFilterDTO;
import com.me.interview.dashboard.dto.QuestionRequestDTO;
import com.me.interview.dashboard.dto.QuestionResponseDTO;
import com.me.interview.dashboard.service.QuestionService;
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
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Question Management", description = "APIs for creating, updating, retrieving, and deleting interview questions")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @Operation(summary = "Add a new Question", description = "Creates a new question and links it to a specific technology.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Question successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<QuestionResponseDTO> createQuestion(
            @RequestBody QuestionRequestDTO requestDTO) {
        QuestionResponseDTO createdQuestion = questionService.createQuestion(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Question by ID", description = "Retrieves a specific question by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Question found"),
            @ApiResponse(responseCode = "404", description = "Question not found")
    })
    public ResponseEntity<QuestionResponseDTO> getQuestionById(
            @Parameter(description = "ID of the question to be retrieved", required = true)
            @PathVariable Long id) {
        QuestionResponseDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }

    @GetMapping
    @Operation(summary = "Get all Questions", description = "Retrieves a paginated list of questions. Supports dynamic filtering based on question text, technology, or date listed.")
    @ApiResponse(responseCode = "200", description = "List of questions retrieved successfully")
    public ResponseEntity<Page<QuestionResponseDTO>> getQuestions(
            @ModelAttribute QuestionFilterDTO filter,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {

        Page<QuestionResponseDTO> questions = questionService.getQuestions(filter, pageable);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Question", description = "Updates a question's text or linked technology.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Question updated successfully"),
            @ApiResponse(responseCode = "404", description = "Question not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided")
    })
    public ResponseEntity<QuestionResponseDTO> updateQuestion(
            @Parameter(description = "ID of the question to be updated", required = true)
            @PathVariable Long id,
            @RequestBody QuestionRequestDTO requestDTO) {
        QuestionResponseDTO updatedQuestion = questionService.updateQuestion(id, requestDTO);
        return ResponseEntity.ok(updatedQuestion);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Question", description = "Deletes a question by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Question deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Question not found")
    })
    public ResponseEntity<Void> deleteQuestion(
            @Parameter(description = "ID of the question to be deleted", required = true)
            @PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}