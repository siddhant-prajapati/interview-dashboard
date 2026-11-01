package com.me.interview.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendEmailResponseDTO {
    private boolean success;
    private String message;
    private String to;
    private String subject;
    private LocalDateTime sentAt;
}
