package com.me.interview.dashboard.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PlatformRequestDTO {
    private String name;
    private String accountLink;
    private LocalDateTime lastUpdatedDate;
    private Integer jobPostCount;
    private Long userId;
}
