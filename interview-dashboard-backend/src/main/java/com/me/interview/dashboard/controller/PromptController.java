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

import com.me.interview.dashboard.dto.AlignmentEmailRequestDTO;
import com.me.interview.dashboard.model.Company;
import com.me.interview.dashboard.model.JobApplication;
import com.me.interview.dashboard.model.Technology;
import com.me.interview.dashboard.model.User;
import com.me.interview.dashboard.repository.JobApplicationRepository;
import com.me.interview.dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "AI-powered features: email generation and JD parsing via OpenRouter LLM")
public class PromptController {

    private final EmailPromptGeneratorService promptGeneratorService;
    private final OpenRouterService openRouterService;
    private final JdParseService jdParseService;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    @Qualifier("aiTaskExecutor")
    private final Executor aiTaskExecutor;

    // ── JD Parser ────────────────────────────────────────────────────────────

    /**
     * POST /api/ai/jd/parse
     * <p>
     * Accepts a raw job description and returns structured
     * {@link JdParseResponseDTO} fields ready to prefill the Bulk Apply form
     * asynchronously.
     * </p>
     */
    @PostMapping("/jd/parse")
    @Operation(summary = "Parse a raw job description and extract structured fields via LLM asynchronously")
    public CompletableFuture<ResponseEntity<JdParseResponseDTO>> parseJobDescription(
            @RequestBody JdParseRequestDTO request) {
        return jdParseService.parseAsync(request.jobDescription())
                .thenApply(ResponseEntity::ok);
    }

    // ── Email Generation ─────────────────────────────────────────────────────

    @GetMapping("/emails/alignment")
    @Operation(summary = "Generate a skill alignment email directly from the LLM via GET")
    public CompletableFuture<ResponseEntity<PromptResponseDTO>> generateAlignmentEmail(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) Long jobApplicationId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String technologies,
            @RequestParam(required = false) String jdText) {

        return CompletableFuture.supplyAsync(() -> {
            String appRole;
            String appCompany;
            String defaultSubject;
            String generatedPrompt;

            if (jobApplicationId != null && jobApplicationId > 0) {
                generatedPrompt = promptGeneratorService.generateAlignmentAndTopicsPrompt(userId, jobApplicationId);
                JobApplication app = jobApplicationRepository.findById(jobApplicationId).orElse(null);
                appRole = app != null && app.getRole() != null ? app.getRole() : "Software Engineer";
                appCompany = app != null && app.getCompany() != null && app.getCompany().getName() != null ? app.getCompany().getName() : "Target Company";
                defaultSubject = "Skill Alignment Analysis - " + appRole + " at " + appCompany;
            } else {
                User user = userRepository.findById(userId)
                        .orElseGet(() -> userRepository.findAll().stream().findFirst()
                                .orElse(User.builder().name("Candidate").experience(2.0).build()));

                appRole = role != null && !role.isBlank() ? role : "Software Engineer";
                appCompany = company != null && !company.isBlank() ? company : "Hiring Team";
                defaultSubject = "Skill Alignment Analysis - " + appRole + " at " + appCompany;

                JobApplication ephemeralApp = JobApplication.builder()
                        .role(appRole)
                        .company(Company.builder().name(appCompany).build())
                        .about(jdText != null ? jdText : "")
                        .build();

                if (technologies != null && !technologies.isBlank()) {
                    List<Technology> techList = Arrays.stream(technologies.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .map(name -> Technology.builder().name(name).build())
                            .toList();
                    ephemeralApp.setTechnologies(techList);
                }

                generatedPrompt = promptGeneratorService.generateAlignmentAndTopicsPrompt(user, ephemeralApp);
            }

            String finalEmail;
            try {
                finalEmail = openRouterService.generateEmailFromPrompt(generatedPrompt);
            } catch (Exception ex) {
                finalEmail = String.format("""
                        Dear Hiring Team at %s,

                        I am reaching out regarding the %s opportunity. With my hands-on engineering experience, I am confident in my ability to contribute effectively to your team.

                        Key Highlights:
                        - Target Role: %s
                        - Core Stack: %s

                        I have attached my resume for your review and would welcome the opportunity to discuss how my skill set aligns with your engineering goals.

                        Best regards,
                        Candidate
                        """, appCompany, appRole, appRole, technologies != null && !technologies.isBlank() ? technologies : "Software Engineering");
            }
            return ResponseEntity.ok(PromptResponseDTO.fromText(finalEmail, defaultSubject));
        }, aiTaskExecutor);
    }

    @PostMapping("/emails/alignment")
    @Operation(summary = "Generate a skill alignment email directly from the LLM via POST")
    public CompletableFuture<ResponseEntity<PromptResponseDTO>> generateAlignmentEmailPost(
            @RequestBody(required = false) AlignmentEmailRequestDTO request,
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) Long jobApplicationId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String technologies,
            @RequestParam(required = false) String jdText) {

        Long effectiveUserId = request != null && request.userId() != null ? request.userId() : userId;
        Long effectiveJobAppId = request != null && request.jobApplicationId() != null ? request.jobApplicationId() : jobApplicationId;
        String effectiveRole = request != null && request.role() != null ? request.role() : role;
        String effectiveCompany = request != null && request.company() != null ? request.company() : company;
        String effectiveTechnologies = request != null && request.technologies() != null ? request.technologies() : technologies;
        String effectiveJdText = request != null && request.jdText() != null ? request.jdText() : jdText;

        return generateAlignmentEmail(effectiveUserId, effectiveJobAppId, effectiveRole, effectiveCompany, effectiveTechnologies, effectiveJdText);
    }

    @GetMapping("/emails/follow-up")
    @Operation(summary = "Generate a follow-up email directly from the LLM")
    public ResponseEntity<PromptResponseDTO> generateFollowUpEmail(
            @RequestParam Long userId,
            @RequestParam Long jobApplicationId,
            @RequestParam int followUpNumber,
            @RequestParam int daysSinceLastContact,
            @RequestParam(required = false, defaultValue = "Submitted application") String lastInteractionContext) {

        if (userId == null || jobApplicationId == null) {
            throw new IllegalArgumentException("User ID and Job Application ID must not be null.");
        }

        // 1. Generate the optimized prompt string
        String generatedPrompt = promptGeneratorService.generateFollowUpEmailPrompt(
                userId,
                jobApplicationId,
                followUpNumber,
                daysSinceLastContact,
                lastInteractionContext != null ? lastInteractionContext : "Submitted application");

        // 2. Pass the prompt to OpenRouter to get the final email
        String finalEmail = openRouterService.generateEmailFromPrompt(generatedPrompt);
        
        return ResponseEntity.ok(new PromptResponseDTO(finalEmail));
    }

    @PostMapping("/emails/generate-cold-email")
    @Operation(summary = "Generate a tailored cold application / recruiter outreach email via LLM")
    public ResponseEntity<PromptResponseDTO> generateColdEmail(
            @RequestBody(required = false) com.me.interview.dashboard.dto.ColdEmailGenerateRequestDTO request) {

        var safeRequest = request != null ? request : new com.me.interview.dashboard.dto.ColdEmailGenerateRequestDTO();

        String prompt = String.format(
                """
                        You are a career coach and senior software engineer. Write a concise, polite, and impactful job application outreach email to the hiring team / recruiter.

                        Details:
                        - Candidate Name: %s
                        - Experience: %.1f years
                        - Target Role: %s
                        - Target Company: %s
                        - Key Tech Stack: %s
                        - Portfolio: %s
                        - LinkedIn: %s
                        - Context / JD Snippet: %s

                        Requirements:
                        1. Subject line at the very top starting with 'Subject: '
                        2. Professional greeting to the hiring manager or recruiter
                        3. Short hook explaining why the candidate is a strong fit with measurable enthusiasm
                        4. Highlight relevant experience and the mentioned tech stack
                        5. Polite call to action requesting a brief 10-15 min conversation
                        6. Clean signature
                        7. Output ONLY the email content without extra commentary or markdown code fences.
                        """,
                safeRequest.getCandidateName() != null ? safeRequest.getCandidateName() : "Siddhant Prajapati",
                safeRequest.getCandidateExperience() != null ? safeRequest.getCandidateExperience() : 2.0,
                safeRequest.getRole() != null ? safeRequest.getRole() : "Software Engineer",
                safeRequest.getCompanyName() != null ? safeRequest.getCompanyName() : "Hiring Team",
                safeRequest.getTechnologies() != null ? safeRequest.getTechnologies() : "Java, Spring Boot, MySQL",
                safeRequest.getPortfolioLink() != null ? safeRequest.getPortfolioLink() : "Available upon request",
                safeRequest.getLinkedInLink() != null ? safeRequest.getLinkedInLink() : "",
                safeRequest.getJobDescription() != null && !safeRequest.getJobDescription().isBlank()
                        ? safeRequest.getJobDescription().substring(0, Math.min(safeRequest.getJobDescription().length(), 1000))
                        : "General job application.");

        String generatedEmail = openRouterService.generateEmailFromPrompt(prompt);
        return ResponseEntity.ok(new PromptResponseDTO(generatedEmail));
    }
}