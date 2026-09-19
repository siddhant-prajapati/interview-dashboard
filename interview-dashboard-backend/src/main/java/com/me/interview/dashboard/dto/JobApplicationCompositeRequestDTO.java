package com.me.interview.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.me.interview.dashboard.enumeration.ApplicationStatus;
import com.me.interview.dashboard.enumeration.JobType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JobApplicationCompositeRequestDTO {
    private String platform;
    private LocalDate postingDate;
    private String about;
    private String role;
    private Double experience;
    private String expectedSalary;
    private JobType jobType;
    private LocalDate applyDate;
    private ApplicationStatus status;
    private Integer followUpCount;
    private Boolean portfolioShared;
    private Boolean linkedInProfileShared;
    private String jobUrl;

    private CompanyNestedDTO company;
    private ResumeNestedDTO resume;

    // Handles key name matching the payload
    @JsonProperty("technologys")
    private List<TechnologyNestedDTO> technologys;
}
