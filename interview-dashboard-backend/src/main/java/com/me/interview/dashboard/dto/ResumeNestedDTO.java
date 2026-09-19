package com.me.interview.dashboard.dto;

import lombok.Data;

@Data
public class ResumeNestedDTO {
    private Long id; // Null if new, populated if existing
    private String resumeName;
    private String documentPath;
}
