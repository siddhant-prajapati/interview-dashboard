package com.me.interview.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColdEmailGenerateRequestDTO {
    private String role;
    private String companyName;
    private String technologies;
    private String candidateName;
    private Double candidateExperience;
    private String portfolioLink;
    private String linkedInLink;
    private String jobDescription;
}
