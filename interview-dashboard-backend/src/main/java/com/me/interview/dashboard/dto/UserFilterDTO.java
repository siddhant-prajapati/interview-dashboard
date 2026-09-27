package com.me.interview.dashboard.dto;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserFilterDTO {
    private String username;
    private String email;
    private String name;
    private Double minExperience;
    private LocalDateTime createdAfter;
    private LocalDateTime createdBefore;
    private String linkedInLink;
    private Long companyId; // Find all users who worked at a specific company
}