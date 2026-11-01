package com.me.interview.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendEmailRequestDTO {
    private String to;
    private String subject;
    private String body;
    private String candidateName;
    private String candidateEmail;
    private String companyName;
    private String role;
    private Long jobApplicationId;
}
