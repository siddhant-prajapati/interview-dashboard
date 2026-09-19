package com.me.interview.dashboard.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResumeResponseDTO {
    private Long id;
    private String resumeName;
    private String documentPath;
    private LocalDateTime updatedOn;
    private LocalDateTime createdAt;
}
