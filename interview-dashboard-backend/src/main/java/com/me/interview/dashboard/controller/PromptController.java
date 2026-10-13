package com.me.interview.dashboard.controller;

import com.me.interview.dashboard.dto.JdParseRequestDTO;
import com.me.interview.dashboard.dto.JdParseResponseDTO;
import com.me.interview.dashboard.dto.PromptResponseDTO;
import com.me.interview.dashboard.service.EmailPromptGeneratorService;
import com.me.interview.dashboard.service.JdParseService;
import com.me.interview.dashboard.service.OpenRouterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "AI-powered features: email generation and JD parsing via OpenRouter LLM")
public class PromptController {

    private final EmailPromptGeneratorService promptGeneratorService;
    private final OpenRouterService openRouterService;
    private final JdParseService jdParseService;

    // ── JD Parser ────────────────────────────────────────────────────────────

    /**
     * POST /api/ai/jd/parse
     * <p>
     * Accepts a raw job description and returns structured
     * {@link JdParseResponseDTO} fields ready to prefill the Bulk Apply form.
     * </p>
     */
    @PostMapping("/jd/parse")
    @Operation(summary = "Parse a raw job description and extract structured fields via LLM")
    public ResponseEntity<JdParseResponseDTO> parseJobDescription(
            @RequestBody JdParseRequestDTO request) {
        JdParseResponseDTO parsed = jdParseService.parse(request.jobDescription());
        return ResponseEntity.ok(parsed);
    }

    // ── Email Generation ─────────────────────────────────────────────────────

    @GetMapping("/emails/alignment")
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

    @GetMapping("/emails/follow-up")
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
                lastInteractionContext);

        // 2. Pass the prompt to OpenRouter to get the final email
        String finalEmail = openRouterService.generateEmailFromPrompt(generatedPrompt);
        
        return ResponseEntity.ok(new PromptResponseDTO(finalEmail));
    }
}