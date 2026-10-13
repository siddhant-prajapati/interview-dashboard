package com.me.interview.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * DTO returned by the JD-parse AI endpoint.
 * Fields map 1-to-1 with {@link JobApplicationRequestDTO} plus a
 * company name / location extracted from the JD.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JdParseResponseDTO {

    /** Extracted job title / role. */
    private String role;

    /** Company name (extracted from JD text). */
    private String companyName;

    /** Company location string (e.g. "India – Remote"). */
    private String location;

    /** Comma-separated technology / skill keywords mentioned in the JD. */
    private String technologies;

    /** Expected or advertised salary (free-form string). */
    private String expectedSalary;

    /** Years of experience required (null if not determinable). */
    private Double experience;

    /**
     * Job arrangement: REMOTE | HYBRID | ON_SITE.
     * Defaults to REMOTE when not determinable.
     */
    private String jobType;

    /** Full job description text (truncated to 1 200 chars for the "about" field). */
    private String about;

    /** Public job posting URL if found in the text, otherwise null. */
    private String jobUrl;

    /** Platform name if mentioned (e.g. "LinkedIn", "Naukri"), otherwise null. */
    private String platform;

    /** Comma-separated list of notable benefits mentioned. */
    private String benefits;

    /** Quick 2–3 sentence summary of the role. */
    private String summary;
}
