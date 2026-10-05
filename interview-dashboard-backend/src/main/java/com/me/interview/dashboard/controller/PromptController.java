package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.PromptResponseDTO;
import com.me.interview.dashboard.service.EmailPromptGeneratorService;
import com.me.interview.dashboard.service.OpenRouterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/emails")
@RequiredArgsConstructor
@Tag(name = "AI Email Generation", description = "Calls OpenRouter LLM to generate actual emails based on user data")
public class PromptController {

    private final EmailPromptGeneratorService promptGeneratorService;
    private final OpenRouterService openRouterService;

    @GetMapping("/alignment")
    @Operation(summary = "Generate a skill alignment email directly from the LLM")
    public ResponseEntity<PromptResponseDTO> generateAlignmentEmail(
            @RequestParam Long userId,
            @RequestParam Long jobApplicationId) {

        // 1. Generate the optimized prompt string
        String generatedPrompt = promptGeneratorService.generateAlignmentAndTopicsPrompt(userId, jobApplicationId);
        
        // 2. Pass the prompt to OpenRouter to get the final email
        String finalEmail = openRouterService.generateEmailFromPrompt(generatedPrompt);
        
        return ResponseEntity.ok(new PromptResponseDTO(finalEmail));
    }

    @GetMapping("/follow-up")
    @Operation(summary = "Generate a follow-up email directly from the LLM")
    public ResponseEntity<PromptResponseDTO> generateFollowUpEmail(
            @RequestParam Long userId,
            @RequestParam Long jobApplicationId,
            @RequestParam int followUpNumber,
            @RequestParam int daysSinceLastContact,
            @RequestParam(required = false, defaultValue = "Submitted application") String lastInteractionContext) {

        // 1. Generate the optimized prompt string
        String generatedPrompt = promptGeneratorService.generateFollowUpEmailPrompt(
                userId,
                jobApplicationId,
                followUpNumber,
                daysSinceLastContact,
                lastInteractionContext
        );
        
        // 2. Pass the prompt to OpenRouter to get the final email
        String finalEmail = openRouterService.generateEmailFromPrompt(generatedPrompt);
        
        return ResponseEntity.ok(new PromptResponseDTO(finalEmail));
    }
}