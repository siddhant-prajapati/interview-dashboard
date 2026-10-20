package com.me.interview.dashboard.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.me.interview.dashboard.dto.JdParseResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Calls the OpenRouter LLM with an optimized, lightweight prompt to extract
 * key structured fields from a Job Description.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JdParseService {

    private final OpenRouterService openRouterService;
    private final ObjectMapper objectMapper;

    // Ultra-compact prompt: No wasteful echoing of verbatim descriptions or perks
    private static final String SYSTEM_PROMPT = """
            Extract structured fields from this job description as a raw JSON object (no markdown fences, no explanations).
            Return ONLY this JSON schema:
            {
              "role": "exact job title",
              "companyName": "company name",
              "location": "location or Remote",
              "technologies": "comma-separated skills/tech stack",
              "expectedSalary": "salary or empty string",
              "experience": 0.0,
              "jobType": "REMOTE" | "HYBRID" | "ON_SITE",
              "hrEmail": "recruiter, career, or HR email address if mentioned, else empty string",
              "summary": "1 concise sentence overview of the role"
            }
            Rules: Use null for unknown experience, empty string "" for any other unknown field.
            """;

    private static final java.util.regex.Pattern EMAIL_PATTERN =
            java.util.regex.Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    /**
     * Parses the given job description text using the LLM and returns a
     * structured {@link JdParseResponseDTO}.
     *
     * @param jobDescription raw JD text
     * @return populated DTO ready to prefill the BulkApply form
     */
    public JdParseResponseDTO parse(String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) {
            return new JdParseResponseDTO();
        }

        // 1. Trim JD to first 2500 chars (where title, company, requirements, salary are located)
        String trimmedJd = jobDescription.length() > 2500
                ? jobDescription.substring(0, 2500)
                : jobDescription;

        String combinedPrompt = SYSTEM_PROMPT + "\n\nJob Description:\n" + trimmedJd;

        String rawJson = openRouterService.generateEmailFromPrompt(combinedPrompt);

        // Strip any markdown code fences the LLM may add
        rawJson = rawJson.strip();
        if (rawJson.startsWith("```")) {
            rawJson = rawJson.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").strip();
        }

        JdParseResponseDTO result;
        try {
            result = objectMapper.readValue(rawJson, JdParseResponseDTO.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse LLM response as JSON. Raw response:\n{}", rawJson, e);
            result = new JdParseResponseDTO();
        }

        // 2. Set 'about' directly in Java from the original JD text (saves ~400 LLM output tokens!)
        result.setAbout(jobDescription.substring(0, Math.min(jobDescription.length(), 1500)));

        // 3. Sensible defaults if not returned by LLM
        if (result.getJobType() == null || result.getJobType().isBlank()) {
            result.setJobType("REMOTE");
        }

        // 4. Regex fallback for hrEmail if LLM missed it
        if (result.getHrEmail() == null || result.getHrEmail().isBlank()) {
            java.util.regex.Matcher matcher = EMAIL_PATTERN.matcher(jobDescription);
            if (matcher.find()) {
                result.setHrEmail(matcher.group());
            }
        }

        return result;
    }
}
