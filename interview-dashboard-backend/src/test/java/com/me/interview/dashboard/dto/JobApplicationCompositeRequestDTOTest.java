package com.me.interview.dashboard.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JobApplicationCompositeRequestDTOTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void testDeserializeWithPlatformId() throws Exception {
        String json = """
            {
                "role": "Java Developer",
                "platformId": 1
            }
            """;
        JobApplicationCompositeRequestDTO dto = objectMapper.readValue(json, JobApplicationCompositeRequestDTO.class);
        assertEquals("Java Developer", dto.getRole());
        assertEquals(1L, dto.getPlatformId());
    }

    @Test
    void testDeserializeWithPlatformNested() throws Exception {
        String json = """
            {
                "role": "Frontend Developer",
                "platformNested": {
                    "id": 2,
                    "name": "Indeed",
                    "accountLink": "https://indeed.com/profile"
                }
            }
            """;
        JobApplicationCompositeRequestDTO dto = objectMapper.readValue(json, JobApplicationCompositeRequestDTO.class);
        assertEquals("Frontend Developer", dto.getRole());
        assertNotNull(dto.getPlatformNested());
        assertEquals(2L, dto.getPlatformNested().getId());
        assertEquals("Indeed", dto.getPlatformNested().getName());
        assertEquals("https://indeed.com/profile", dto.getPlatformNested().getAccountLink());
    }

    @Test
    void testDeserializeWithFrontendCompositePayload() throws Exception {
        String json = """
            {
                "role": "Full Stack Engineer",
                "platformId": 1,
                "jobType": "REMOTE",
                "experience": 3.5,
                "expectedSalary": "$120,000",
                "postingDate": "2026-10-14",
                "applyDate": "2026-10-14",
                "status": "APPLIED",
                "about": "Great opportunity",
                "jobUrl": "https://linkedin.com/jobs/123",
                "followUpCount": 0,
                "portfolioShared": true,
                "linkedInProfileShared": true,
                "company": {
                    "name": "Acme Corp",
                    "location": "Remote",
                    "allowedJobType": ["REMOTE"],
                    "technologyTest": true
                },
                "resume": {
                    "resumeName": "Primary_Resume.pdf",
                    "documentPath": "/resumes/Primary_Resume.pdf"
                },
                "technologys": [
                    { "name": "Java 21", "type": "LANGUAGE" },
                    { "name": "Spring Boot", "type": "FRAMEWORK" }
                ]
            }
            """;
        JobApplicationCompositeRequestDTO dto = objectMapper.readValue(json, JobApplicationCompositeRequestDTO.class);
        assertEquals("Full Stack Engineer", dto.getRole());
        assertEquals(1L, dto.getPlatformId());
        assertNotNull(dto.getCompany());
        assertEquals("Acme Corp", dto.getCompany().getName());
        assertNotNull(dto.getResume());
        assertEquals("Primary_Resume.pdf", dto.getResume().getResumeName());
        assertNotNull(dto.getTechnologys());
        assertEquals(2, dto.getTechnologys().size());
        assertEquals("Java 21", dto.getTechnologys().get(0).getName());
    }
}

