package com.me.interview.dashboard.dto;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserFilterDTO {
    private String username;
    private String email;
    private LocalDateTime createdAfter;
    private LocalDateTime createdBefore;
}